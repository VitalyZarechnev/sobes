import { quizHref } from '@/entities/content';
import { useProgressState } from '@/entities/progress';
import { getQuiz, quizStats } from '@/entities/quiz';
import { percent } from '@/shared/lib';
import { ProgressBar } from '@/shared/ui';

export function TopicQuizCard({ pageId }: { readonly pageId: string }) {
  const state = useProgressState();
  const quiz = getQuiz(pageId);
  if (!quiz) return null;
  const stats = quizStats(quiz, state.quizzes[quiz.id]);
  return (
    <a className="topic-quiz" href={quizHref(quiz.id)}>
      <span className="topic-quiz__icon" aria-hidden="true">🧪</span>
      <span className="topic-quiz__body">
        <strong>Тест и задачи по теме</strong>
        <span className="muted">
          {stats.questions} вопросов{stats.tasks > 0 && ` · ${stats.tasks} задач`}
          {stats.answered > 0 && ` · отвечено ${stats.answered}, верно ${percent(stats.correct, stats.answered)}%`}
        </span>
        <ProgressBar done={stats.answered + stats.solved} total={stats.questions + stats.tasks} size="sm" />
      </span>
      <span className="topic-quiz__go">Пройти →</span>
    </a>
  );
}
