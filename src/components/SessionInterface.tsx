'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionTimer } from './SessionTimer';
import { readChatStream } from '@/lib/chat-stream';

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: Date;
}

interface PreviousSession {
  sessionNumber: number;
  messages: Message[];
}

interface SessionInterfaceProps {
  sessionId: string;
  sessionNumber: number;
  clientName: string;
  presentingConcern: string;
  existingMessages: Message[];
  previousSessions: PreviousSession[];
  mode?: 'THERAPY' | 'DIAGNOSIS';
}

const THERAPY_DURATION = 50 * 60; // 50 minutes
const DIAGNOSIS_DURATION = 30 * 60; // 30 minutes

export function SessionInterface({
  sessionId,
  sessionNumber,
  clientName,
  presentingConcern,
  existingMessages,
  previousSessions,
  mode = 'THERAPY',
}: SessionInterfaceProps) {
  const isDiagnosis = mode === 'DIAGNOSIS';
  const SESSION_DURATION = isDiagnosis ? DIAGNOSIS_DURATION : THERAPY_DURATION;
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(existingMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Calculate remaining time based on existing messages
  const calculateRemainingTime = useCallback(() => {
    if (existingMessages.length === 0) return SESSION_DURATION;

    const firstMessageTime = new Date(existingMessages[0].timestamp).getTime();
    const elapsed = Math.floor((Date.now() - firstMessageTime) / 1000);
    return Math.max(0, SESSION_DURATION - elapsed);
  }, [existingMessages, SESSION_DURATION]);

  const [remainingTime] = useState(calculateRemainingTime);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTimeUp = useCallback(async () => {
    setIsEnded(true);
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
    });
    if (isDiagnosis) {
      router.refresh();
    }
  }, [sessionId, isDiagnosis, router]);

  const handleWarning = useCallback((minutesLeft: number) => {
    setWarning(`${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} remaining`);
    setTimeout(() => setWarning(null), 5000);
  }, []);

  const handleEndSession = async () => {
    const message = isDiagnosis
      ? 'End this intake now? You will be asked for your diagnostic impression and shown the answer.'
      : 'Are you sure you want to end this session early?';
    if (confirm(message)) {
      setIsEnded(true);
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      if (isDiagnosis) {
        router.refresh();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isEnded) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setResponseError(null);

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'student',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    const tempAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      role: 'client',
      content: '',
      timestamp: new Date(),
    };
    let savedUserMessageId: string | undefined;
    let savedAiMessageId: string | undefined;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          previousSessions,
        }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Your login has expired. Please sign in again.'
            : response.status === 404
            ? 'This session is no longer active. Please return to your dashboard.'
            : 'The client could not respond. Please try again.'
        );
      }

      const reader = response.body?.getReader();

      if (!reader) throw new Error('The client response was unavailable. Please try again.');

      // Add placeholder for AI response
      setMessages((prev) => [...prev, tempAiMessage]);

      let aiContent = '';
      await readChatStream(reader, (event) => {
        if (event.userMessageId) savedUserMessageId = event.userMessageId;
        if (event.messageId) savedAiMessageId = event.messageId;
        if (event.content) {
          aiContent += event.content;
          // Capture this value for React's queued state update.
          const content = aiContent;
          setMessages((prev) =>
            prev.map((m) => m.id === tempAiMessage.id ? { ...m, content } : m)
          );
        }
      });

      setMessages((prev) => prev.map((m) => {
        if (m.id === tempUserMessage.id && savedUserMessageId) {
          return { ...m, id: savedUserMessageId };
        }
        if (m.id === tempAiMessage.id && savedAiMessageId) {
          return { ...m, id: savedAiMessageId };
        }
        return m;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove only this failed attempt; keep messages already saved by the server.
      setMessages((prev) =>
        prev.flatMap((m) => {
          if (m.id === tempAiMessage.id) {
            return savedAiMessageId ? [{ ...m, id: savedAiMessageId }] : [];
          }
          if (m.id === tempUserMessage.id) {
            return savedUserMessageId ? [{ ...m, id: savedUserMessageId }] : [];
          }
          return [m];
        })
      );
      if (!savedUserMessageId) setInput(userMessage);
      const errorMessage = error instanceof Error
        ? error.message
        : 'The client could not respond. Please try again.';
      setResponseError(savedUserMessageId
        ? `Your message was saved. ${errorMessage}`
        : errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isEnded) {
    if (isDiagnosis) {
      // Brief state while router.refresh() re-renders the server component
      // into the debrief page.
      return (
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <p className="text-gray-600">Preparing debrief...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Session Complete</h2>
          <p className="text-gray-600 mb-6">
            Session {sessionNumber} with {clientName} has ended.
          </p>
          <button
            onClick={() => {
              router.push('/student');
              router.refresh();
            }}
            className="btn btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">
              {isDiagnosis
                ? `Intake Interview with ${clientName}`
                : `Session ${sessionNumber} with ${clientName}`}
            </h1>
            <p className="text-sm text-gray-500">
              {isDiagnosis
                ? '30-minute diagnostic interview. Introduce yourself and elicit the presenting concern.'
                : sessionNumber === 1
                ? 'First session - Begin by introducing yourself'
                : `Continuing from session ${sessionNumber - 1}`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SessionTimer
              initialSeconds={remainingTime}
              onTimeUp={handleTimeUp}
              onWarning={handleWarning}
            />
            <button
              onClick={handleEndSession}
              className="btn btn-secondary text-sm"
            >
              End Session
            </button>
          </div>
        </div>
        {warning && (
          <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm">
            {warning}
          </div>
        )}
      </div>

      {/* Client Info Banner (hidden in diagnosis mode — students should elicit this) */}
      {!isDiagnosis && (
        <div className="bg-gray-50 border-x border-gray-200 p-3">
          <p className="text-sm">
            <span className="font-medium">Presenting Concern:</span>{' '}
            {presentingConcern}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="bg-white border-x border-gray-200 h-[400px] overflow-y-auto p-4 chat-container">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {isDiagnosis ? (
              <>
                <p>Begin the intake by introducing yourself.</p>
                <p className="text-sm mt-2">
                  You might start with: &quot;Hello, I&apos;m [your name]. Thanks
                  for coming in today. What brings you here?&quot;
                </p>
              </>
            ) : sessionNumber === 1 ? (
              <>
                <p>Begin the session by introducing yourself.</p>
                <p className="text-sm mt-2">
                  You might start with: &quot;Hello, my name is [your name]. What
                  brings you in today?&quot;
                </p>
              </>
            ) : (
              <>
                <p>Continue your session with {clientName}.</p>
                <p className="text-sm mt-2">
                  You might start with: &quot;It&apos;s good to see you again. How have
                  things been since we last met?&quot;
                </p>
              </>
            )}
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'student' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'student'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-xs font-medium mb-1 opacity-70">
                {message.role === 'student' ? 'You (Therapist)' : clientName}
              </p>
              <p className="whitespace-pre-wrap">
                {message.content.trim() ? message.content : (isLoading && message.id.startsWith('temp-ai-')
                  ? 'Typing...'
                  : 'No response was received.')}
              </p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'student' && (
          <div className="text-left mb-4">
            <div className="inline-block bg-gray-100 p-3 rounded-lg">
              <p className="text-xs font-medium mb-1 opacity-70">{clientName}</p>
              <p className="text-gray-500">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-xl border border-t-0 border-gray-200 p-4">
        {responseError && (
          <p role="alert" className="text-sm text-red-700 mb-3">
            {responseError}
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            className="input flex-1 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary self-end"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
