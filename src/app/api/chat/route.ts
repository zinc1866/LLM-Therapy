import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import anthropic, { ANTHROPIC_MODEL } from '@/lib/anthropic';
import { buildSystemPrompt, buildConversationMessages } from '@/lib/prompts';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
      });
    }

    if (
      !body ||
      typeof body.sessionId !== 'string' ||
      !body.sessionId.trim() ||
      typeof body.message !== 'string' ||
      !body.message.trim()
    ) {
      return new Response(
        JSON.stringify({ error: 'A session and a message are required' }),
        { status: 400 }
      );
    }

    const { sessionId } = body;
    const message = body.message.trim();
    const previousSessions = body.previousSessions ?? [];
    if (
      !Array.isArray(previousSessions) ||
      previousSessions.some(
        (previous) =>
          !previous ||
          !Number.isInteger(previous.sessionNumber) ||
          !Array.isArray(previous.messages) ||
          previous.messages.some(
            (entry: { role?: unknown; content?: unknown } | null) =>
              !entry ||
              typeof entry.role !== 'string' ||
              typeof entry.content !== 'string'
          )
      )
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid previous session history' }),
        { status: 400 }
      );
    }

    // Get the session and verify ownership
    const therapySession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        assignment: {
          studentId: session.user.id,
          student: { archivedAt: null },
        },
        status: 'IN_PROGRESS',
      },
      include: {
        assignment: {
          include: {
            client: true,
          },
        },
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!therapySession) {
      return new Response(
        JSON.stringify({ error: 'Session not found or not active' }),
        { status: 404 }
      );
    }

    // Save the user's message
    const userMessage = await prisma.message.create({
      data: {
        sessionId,
        role: 'student',
        content: message,
      },
    });

    // Build the system prompt
    const systemPrompt = buildSystemPrompt(
      therapySession.assignment.client,
      therapySession.sessionNumber,
      previousSessions
    );

    // Build conversation history
    const conversationHistory = buildConversationMessages([
      ...therapySession.messages.filter((entry) => entry.content.trim()),
      { role: 'student', content: message },
    ]);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Acknowledge the saved question even if the provider or connection fails.
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ userMessageId: userMessage.id })}\n\n`
            )
          );
          let fullResponse = '';
          let completed = false;

          const isDiagnosis =
            therapySession.assignment.client.mode === 'DIAGNOSIS';

          const response = await anthropic.messages.create({
            model: ANTHROPIC_MODEL,
            max_tokens: isDiagnosis ? 150 : 300,
            system: systemPrompt,
            messages: conversationHistory,
            stream: true,
          });

          for await (const event of response) {
            if (event.type === 'message_stop') {
              completed = true;
            }
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text;
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              );
            }
          }

          if (!completed || !fullResponse.trim()) {
            throw new Error('Claude returned an incomplete or empty response');
          }

          // Save the AI's response
          const aiMessage = await prisma.message.create({
            data: {
              sessionId,
              role: 'client',
              content: fullResponse,
            },
          });

          // Send the message IDs
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                messageId: aiMessage.id,
                userMessageId: userMessage.id,
              })}\n\n`
            )
          );

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const status =
            error && typeof error === 'object' && 'status' in error
              ? error.status
              : undefined;
          const errorMessage =
            status === 401 || status === 403 || status === 404
              ? 'The simulator is temporarily unavailable. Please contact your instructor.'
              : status === 429
              ? 'The simulator is busy right now. Please try again shortly.'
              : 'The client could not finish responding. Please try again.';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: errorMessage,
                userMessageId: userMessage.id,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process message' }), {
      status: 500,
    });
  }
}
