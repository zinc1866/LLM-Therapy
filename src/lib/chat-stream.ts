export interface ChatStreamEvent {
  content?: string;
  messageId?: string;
  userMessageId?: string;
  error?: string;
}

const INCOMPLETE_RESPONSE =
  'The client response was interrupted. Please try again.';

/** Read our SSE protocol without assuming network chunks end at event boundaries. */
export async function readChatStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  let saved = false;
  let completed = false;

  const processEvent = (event: string) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');

    // Comments and keep-alive events have no data.
    if (!data) return;
    if (data === '[DONE]') {
      if (!content.trim() || !saved) throw new Error(INCOMPLETE_RESPONSE);
      completed = true;
      return;
    }

    let parsed: ChatStreamEvent;
    try {
      const value: unknown = JSON.parse(data);
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid event');
      }
      parsed = value as ChatStreamEvent;
      for (const key of ['content', 'messageId', 'userMessageId', 'error'] as const) {
        if (parsed[key] !== undefined && typeof parsed[key] !== 'string') {
          throw new Error('Invalid event field');
        }
      }
    } catch {
      throw new Error('The client response could not be read. Please try again.');
    }

    // Deliver saved user IDs even on errors so the UI can keep their message.
    onEvent(parsed);
    if (parsed.error) throw new Error(parsed.error);
    if (parsed.content) content += parsed.content;
    if (parsed.messageId && parsed.userMessageId) saved = true;
  };

  try {
    while (!completed) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });

      // Buffer the whole event, including separators split across reads.
      let boundary: RegExpExecArray | null;
      while (!completed && (boundary = /\r?\n\r?\n/.exec(buffer))) {
        const event = buffer.slice(0, boundary.index);
        buffer = buffer.slice(boundary.index + boundary[0].length);
        processEvent(event);
      }

      if (done) break;
    }

    if (!completed) throw new Error(INCOMPLETE_RESPONSE);
  } finally {
    // Also cancel after errors or [DONE], rather than leaving an unread stream.
    try {
      await reader.cancel();
    } catch {
      // Preserve the original response/error if the connection already closed.
    }
    reader.releaseLock();
  }
}
