import Anthropic from '@anthropic-ai/sdk';

export const ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;
