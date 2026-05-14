import { QUESTIONS } from '@/lib/forensic-quiz/questions';
import { QuizClient } from './QuizClient';

export default function TakeQuizPage() {
  // Strip tag weights before sending to the client — they don't need to be exposed.
  const safeQuestions = QUESTIONS.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    helper: q.helper,
    options: q.options.map((o) => ({ id: o.id, label: o.label })),
  }));

  return <QuizClient questions={safeQuestions} />;
}
