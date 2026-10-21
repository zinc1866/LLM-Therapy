import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Isolate the route's external services so these tests need no credentials.
const routePath = path.resolve('src/app/api/chat/route.ts');
const routeSource = ts.transpileModule(readFileSync(routePath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;

type ProviderEvent =
  | { type: 'message_stop' }
  | {
      type: 'content_block_delta';
      delta: { type: 'text_delta'; text: string };
    };

type SavedMessage = {
  id: string;
  sessionId: string;
  role: string;
  content: string;
};

type ProviderRequest = {
  model: string;
  messages: { role: string; content: string }[];
};

function textDelta(text: string): ProviderEvent {
  return { type: 'content_block_delta', delta: { type: 'text_delta', text } };
}

function createHarness(events: ProviderEvent[], providerError?: Error) {
  const saved: SavedMessage[] = [];
  const providerRequests: ProviderRequest[] = [];
  const loggedErrors: unknown[][] = [];
  const mocks: Record<string, unknown> = {
    'next-auth': {
      getServerSession: async () => ({
        user: { id: 'student-1', role: 'STUDENT' },
      }),
    },
    '@/lib/auth': { authOptions: {} },
    '@/lib/db': {
      __esModule: true,
      default: {
        session: {
          findFirst: async () => ({
            sessionNumber: 1,
            assignment: { client: { name: 'Test Client', mode: 'THERAPY' } },
            messages: [
              { role: 'client', content: '   ' },
              { role: 'student', content: 'Hello.' },
              { role: 'client', content: 'Hi.' },
            ],
          }),
        },
        message: {
          create: async ({ data }: { data: Omit<SavedMessage, 'id'> }) => {
            const message = { id: `message-${saved.length + 1}`, ...data };
            saved.push(message);
            return message;
          },
        },
      },
    },
    '@/lib/anthropic': {
      __esModule: true,
      ANTHROPIC_MODEL: 'configured-test-model',
      default: {
        messages: {
          create: async (options: ProviderRequest) => {
            providerRequests.push(options);
            if (providerError) throw providerError;
            return (async function* () {
              yield* events;
            })();
          },
        },
      },
    },
    '@/lib/prompts': {
      buildSystemPrompt: () => 'Test system prompt',
      buildConversationMessages: (
        messages: { role: string; content: string }[]
      ) =>
        Array.from(messages, (message) => ({
          role: message.role === 'student' ? 'user' : 'assistant',
          content: message.content,
        })),
    },
  };
  const routeModule = {
    exports: {} as { POST(request: Request): Promise<Response> },
  };

  vm.runInNewContext(
    routeSource,
    {
      exports: routeModule.exports,
      module: routeModule,
      require: (name: string) => {
        if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`);
        return mocks[name];
      },
      Response,
      ReadableStream,
      TextEncoder,
      console: { error: (...args: unknown[]) => loggedErrors.push(args) },
    },
    { filename: routePath }
  );

  return {
    saved,
    providerRequests,
    loggedErrors,
    async send() {
      const response = await routeModule.exports.POST(
        new Request('http://localhost/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'session-1',
            message: 'What brings you here?',
          }),
        })
      );
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
      const wire = await response.text();
      const payloads: (Record<string, string> | '[DONE]')[] = wire
        .trim()
        .split('\n\n')
        .map((event) => {
          assert.ok(event.startsWith('data: '));
          const data = event.slice(6);
          return data === '[DONE]' ? data : JSON.parse(data);
        });
      return { wire, payloads };
    },
  };
}

test('completed response streams text and IDs and saves the client reply', async () => {
  const harness = createHarness([
    textDelta('I have been '),
    textDelta('feeling tired.'),
    { type: 'message_stop' },
  ]);
  const { payloads } = await harness.send();

  assert.deepEqual(payloads, [
    { userMessageId: 'message-1' },
    { content: 'I have been ' },
    { content: 'feeling tired.' },
    { messageId: 'message-2', userMessageId: 'message-1' },
    '[DONE]',
  ]);
  assert.deepEqual(harness.saved, [
    {
      id: 'message-1',
      sessionId: 'session-1',
      role: 'student',
      content: 'What brings you here?',
    },
    {
      id: 'message-2',
      sessionId: 'session-1',
      role: 'client',
      content: 'I have been feeling tired.',
    },
  ]);
  assert.equal(harness.providerRequests[0].model, 'configured-test-model');
  assert.deepEqual(harness.providerRequests[0].messages, [
    { role: 'user', content: 'Hello.' },
    { role: 'assistant', content: 'Hi.' },
    { role: 'user', content: 'What brings you here?' },
  ]);
  assert.equal(harness.loggedErrors.length, 0);
});

test('provider rejection returns a safe error and the saved student ID', async () => {
  const providerError = Object.assign(
    new Error('Private provider error containing sk-ant-secret'),
    { status: 404 }
  );
  const harness = createHarness([], providerError);
  const { wire, payloads } = await harness.send();

  assert.deepEqual(payloads, [
    { userMessageId: 'message-1' },
    {
      error:
        'The simulator is temporarily unavailable. Please contact your instructor.',
      userMessageId: 'message-1',
    },
  ]);
  assert.doesNotMatch(wire, /Private|sk-ant-secret/);
  assert.equal(harness.saved.length, 1);
  assert.equal(harness.saved[0].role, 'student');
  assert.equal(harness.loggedErrors[0][1], providerError);
});

test('a completed stream with no text does not save an empty client reply', async () => {
  const harness = createHarness([{ type: 'message_stop' }]);
  const { payloads } = await harness.send();

  assert.deepEqual(payloads, [
    { userMessageId: 'message-1' },
    {
      error: 'The client could not finish responding. Please try again.',
      userMessageId: 'message-1',
    },
  ]);
  assert.equal(harness.saved.length, 1);
  assert.equal(harness.saved[0].role, 'student');
});

test('a stream ending before message_stop does not save a partial client reply', async () => {
  const harness = createHarness([textDelta('I have been')]);
  const { payloads } = await harness.send();

  assert.deepEqual(payloads, [
    { userMessageId: 'message-1' },
    { content: 'I have been' },
    {
      error: 'The client could not finish responding. Please try again.',
      userMessageId: 'message-1',
    },
  ]);
  assert.equal(harness.saved.length, 1);
  assert.equal(harness.saved[0].role, 'student');
});
