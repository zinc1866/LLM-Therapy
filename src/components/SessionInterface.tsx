'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionTimer } from './SessionTimer';

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
}

const SESSION_DURATION = 50 * 60; // 50 minutes in seconds

export function SessionInterface({
  sessionId,
  sessionNumber,
  clientName,
  presentingConcern,
  existingMessages,
  previousSessions,
}: SessionInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(existingMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Calculate remaining time based on existing messages
  const calculateRemainingTime = useCallback(() => {
    if (existingMessages.length === 0) return SESSION_DURATION;

    const firstMessageTime = new Date(existingMessages[0].timestamp).getTime();
    const elapsed = Math.floor((Date.now() - firstMessageTime) / 1000);
    return Math.max(0, SESSION_DURATION - elapsed);
  }, [existingMessages]);

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
    // End the session
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }, [sessionId]);

  const handleWarning = useCallback((minutesLeft: number) => {
    setWarning(`${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} remaining`);
    setTimeout(() => setWarning(null), 5000);
  }, []);

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end this session early?')) {
      setIsEnded(true);
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isEnded) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message optimistically
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'student',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

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
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      // Add placeholder for AI response
      const tempAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        role: 'client',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempAiMessage]);

      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                aiContent += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex].role === 'client') {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: aiContent,
                    };
                  }
                  return updated;
                });
              }
              if (parsed.messageId) {
                // Update with real message IDs
                setMessages((prev) => {
                  const updated = [...prev];
                  // Update user message ID
                  const userIndex = updated.findIndex(
                    (m) => m.id === tempUserMessage.id
                  );
                  if (userIndex !== -1 && parsed.userMessageId) {
                    updated[userIndex] = {
                      ...updated[userIndex],
                      id: parsed.userMessageId,
                    };
                  }
                  // Update AI message ID
                  const aiIndex = updated.findIndex(
                    (m) => m.id === tempAiMessage.id
                  );
                  if (aiIndex !== -1) {
                    updated[aiIndex] = {
                      ...updated[aiIndex],
                      id: parsed.messageId,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistic messages on error
      setMessages((prev) =>
        prev.filter(
          (m) => !m.id.startsWith('temp-')
        )
      );
      alert('Failed to send message. Please try again.');
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
              Session {sessionNumber} with {clientName}
            </h1>
            <p className="text-sm text-gray-500">
              {sessionNumber === 1
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

      {/* Client Info Banner */}
      <div className="bg-gray-50 border-x border-gray-200 p-3">
        <p className="text-sm">
          <span className="font-medium">Presenting Concern:</span>{' '}
          {presentingConcern}
        </p>
      </div>

      {/* Messages */}
      <div className="bg-white border-x border-gray-200 h-[400px] overflow-y-auto p-4 chat-container">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>Begin the session by introducing yourself.</p>
            <p className="text-sm mt-2">
              You might start with: &quot;Hello, my name is [your name]. What
              brings you in today?&quot;
            </p>
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
              <p className="whitespace-pre-wrap">{message.content}</p>
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
