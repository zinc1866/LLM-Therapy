import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import anthropic from '@/lib/anthropic';
import { buildSystemPrompt, buildConversationMessages } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'STUDENT') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  try {
    const { sessionId, message, previousSessions } = await request.json();

    // Get the session and verify ownership
    const therapySession = await prisma.session.findFirst({
      where: {
        id: sessionId,
        assignment: {
          studentId: session.user.id,
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
      previousSessions || []
    );

    // Build conversation history
    const conversationHistory = buildConversationMessages([
      ...therapySession.messages,
      { role: 'student', content: message },
    ]);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            system: systemPrompt,
            messages: conversationHistory,
            stream: true,
          });

          for await (const event of response) {
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
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`
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
