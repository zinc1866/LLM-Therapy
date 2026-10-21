import assert from 'node:assert/strict';
import test from 'node:test';
import { readChatStream, type ChatStreamEvent } from '../src/lib/chat-stream';

const encoder = new TextEncoder();
const frame = (event: ChatStreamEvent) => `data: ${JSON.stringify(event)}\n\n`;
const ids = { messageId: 'client-1', userMessageId: 'student-1' };
const done = 'data: [DONE]\n\n';

function streamFrom(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

async function read(text: string, byteByByte = false) {
  const bytes = encoder.encode(text);
  const stream = streamFrom(byteByByte ? Array.from(bytes, (b) => Uint8Array.of(b)) : [bytes]);
  const events: ChatStreamEvent[] = [];
  await readChatStream(stream.getReader(), (event) => events.push(event));
  assert.equal(stream.locked, false);
  return events;
}

test('reads coalesced text, saved IDs, and completion events', async () => {
  assert.deepEqual(await read(frame({ content: 'I feel ' }) + frame({ content: 'tired.' }) + frame(ids) + done), [
    { content: 'I feel ' }, { content: 'tired.' }, ids,
  ]);
});

test('preserves JSON, metadata, and UTF-8 characters across single-byte network chunks', async () => {
  const content = 'I met André at the café. 🙂';
  assert.deepEqual(await read(frame({ content }) + frame(ids) + done, true), [{ content }, ids]);
});

test('handles CRLF separators split across chunks and ignores keep-alive comments', async () => {
  const input = ': keep-alive\n\n' + frame({ content: 'I am okay.' }) + frame(ids) + done;
  assert.deepEqual(await read(input.replace(/\n/g, '\r\n'), true), [{ content: 'I am okay.' }, ids]);
});

test('surfaces a provider error and delivers the saved student ID', async () => {
  const events: ChatStreamEvent[] = [];
  const error = { error: 'The simulator is busy right now.', userMessageId: 'student-1' };
  const stream = streamFrom([encoder.encode(frame(error))]);
  await assert.rejects(readChatStream(stream.getReader(), (event) => events.push(event)), /simulator is busy/);
  assert.deepEqual(events, [error]);
  assert.equal(stream.locked, false);
});

test('surfaces an error after partial text instead of accepting a truncated reply', async () => {
  await assert.rejects(read(frame({ content: 'Well, I' }) + frame({ error: 'Streaming failed' })), /Streaming failed/);
});

test('rejects a disconnected stream even when partial content was received', async () => {
  await assert.rejects(read(frame({ content: 'Well, I' })), /interrupted/);
});

test('rejects an empty or whitespace-only completed response', async () => {
  for (const content of ['', '   \n']) {
    await assert.rejects(read(frame({ content }) + frame(ids) + done), /interrupted/);
  }
});

test('requires confirmation that the response was saved', async () => {
  await assert.rejects(read(frame({ content: 'Hi.' }) + done), /interrupted/);
});

test('acknowledges a saved student question before an interrupted response', async () => {
  const events: ChatStreamEvent[] = [];
  const stream = streamFrom([encoder.encode(frame({ userMessageId: 'student-1' }))]);
  await assert.rejects(readChatStream(stream.getReader(), (event) => events.push(event)), /interrupted/);
  assert.deepEqual(events, [{ userMessageId: 'student-1' }]);
});

test('reports malformed complete events instead of silently dropping text', async () => {
  for (const payload of ['{broken', 'null', '{"content":123}']) {
    await assert.rejects(read(`data: ${payload}\n\n` + frame(ids) + done), /could not be read/);
  }
});

test('does not swallow errors from event handlers and cancels the reader', async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(encoder.encode(frame({ content: 'Hi.' }))); },
    cancel() { cancelled = true; },
  });
  await assert.rejects(readChatStream(stream.getReader(), () => { throw new Error('Handler failed'); }), /Handler failed/);
  assert.equal(cancelled, true);
  assert.equal(stream.locked, false);
});
