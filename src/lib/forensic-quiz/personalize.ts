import anthropic from '../anthropic';
import { QUESTIONS } from './questions';
import type { CareerScore } from './score';
import type { AnswerMap } from './score';

export type PersonalizedSuggestion = {
  careerId: string;
  whyItFits: string;
};

// Builds a compact, human-readable summary of which option the student picked
// for each question. We send this to Claude rather than raw IDs so the model
// can reason about the actual content of their choices.
function answersDigest(answers: AnswerMap): string {
  const lines: string[] = [];
  for (const q of QUESTIONS) {
    const oid = answers[q.id];
    const option = q.options.find((o) => o.id === oid);
    if (!option) continue;
    lines.push(`Q: ${q.prompt}\nA: ${option.label}`);
  }
  return lines.join('\n\n');
}

// Asks Claude to write a 3-4 sentence "why this career fits this specific
// student" paragraph for each of the top careers, grounded in the student's
// actual answers. Returns an array aligned with `topCareers`.
export async function personalizeSuggestions(
  topCareers: CareerScore[],
  answers: AnswerMap
): Promise<PersonalizedSuggestion[]> {
  const careersBlock = topCareers
    .map(
      (c, i) =>
        `${i + 1}. id=${c.careerId} — ${c.career.title}\n   ${c.career.shortPitch}\n   ${c.career.description}`
    )
    .join('\n\n');

  const prompt = `You are helping an undergraduate student in an Introduction to Forensic Psychology class understand why a set of forensic psychology careers might be a good fit for them, based on the answers they gave on a self-reflection quiz.

The student's answers:
${answersDigest(answers)}

The careers to write about (already chosen for this student):
${careersBlock}

For each career, write a personalized 3-4 sentence paragraph explaining why this career might be a good fit for THIS student, based on the specific answers they gave. Reference at least one or two specific choices they made (without quoting the question text). Be warm, encouraging, and grounded — do not overpromise or imply this is a definitive recommendation. Do not repeat the career description; focus on the fit.

Respond ONLY with a valid JSON array of objects of this exact shape, in the same order as the careers above:
[
  {"careerId": "<id from above>", "whyItFits": "<3-4 sentence personalized paragraph>"},
  ...
]
No prose before or after the JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const raw = textBlock.text.trim();
  // Strip a code fence if the model added one despite instructions.
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: PersonalizedSuggestion[];
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Failed to parse personalization JSON: ${cleaned.slice(0, 200)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Personalization response was not an array');
  }

  // Ensure every requested career has an entry, in the requested order.
  // Fall back to a generic blurb only if the model dropped one.
  return topCareers.map((tc) => {
    const match = parsed.find((p) => p.careerId === tc.careerId);
    return {
      careerId: tc.careerId,
      whyItFits:
        match?.whyItFits?.trim() ||
        `Based on your answers, ${tc.career.title} may be worth a closer look.`,
    };
  });
}
