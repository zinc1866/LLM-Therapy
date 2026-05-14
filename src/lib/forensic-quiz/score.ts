import { CAREERS, CAREERS_BY_ID, type Career } from './careers';
import { QUESTIONS, type Question } from './questions';
import type { Tag, TagWeights } from './tags';

export type AnswerMap = Record<string, string>; // questionId -> optionId

export type CareerScore = {
  careerId: string;
  career: Career;
  score: number;       // raw dot product
  normalized: number;  // 0..1, scaled to top result
};

const QUESTIONS_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q])
);

// Sum tag weights from the student's selected options.
export function tagVectorFromAnswers(answers: AnswerMap): TagWeights {
  const vec: Partial<Record<Tag, number>> = {};
  for (const [qid, oid] of Object.entries(answers)) {
    const question = QUESTIONS_BY_ID[qid];
    if (!question) continue;
    const option = question.options.find((o) => o.id === oid);
    if (!option) continue;
    for (const [tag, weight] of Object.entries(option.weights)) {
      const t = tag as Tag;
      vec[t] = (vec[t] ?? 0) + (weight ?? 0);
    }
  }
  return vec;
}

// Dot product between the student's vector and the career's tag profile.
export function scoreCareer(
  studentVec: TagWeights,
  career: Career
): number {
  let score = 0;
  for (const [tag, careerWeight] of Object.entries(career.weights)) {
    const studentWeight = studentVec[tag as Tag] ?? 0;
    score += studentWeight * (careerWeight ?? 0);
  }
  return score;
}

// Returns top N careers by score. Always returns at least 5 even when ties
// or zero overlap (falls back to default ordering by id for determinism).
export function topCareers(answers: AnswerMap, n = 5): CareerScore[] {
  const studentVec = tagVectorFromAnswers(answers);

  const scored: CareerScore[] = CAREERS.map((career) => ({
    careerId: career.id,
    career,
    score: scoreCareer(studentVec, career),
    normalized: 0,
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.careerId.localeCompare(b.careerId);
  });

  const top = scored.slice(0, n);
  const max = top[0]?.score ?? 0;
  for (const item of top) {
    item.normalized = max > 0 ? item.score / max : 0;
  }
  return top;
}

export { CAREERS_BY_ID };
