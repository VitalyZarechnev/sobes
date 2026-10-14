import { getPage, pageHref, SECTIONS } from '@/entities/content';
import { progressActions, useProgressState } from '@/entities/progress';
import { getQuiz } from '@/entities/quiz';
import { QuizRunner } from '@/widgets/quiz-runner';
import { routes } from '@/shared/config';
import { NotFound } from '@/shared/ui';

export function QuizPage({ quizId }: { readonly quizId: string }) {
  const state = useProgressState();
  const quiz = getQuiz(quizId);
  if (!quiz) return <NotFound />;

  const section = SECTIONS.find((s) => s.id === quiz.section);
  const theory = getPage(quiz.id);
  const progress = state.quizzes[quiz.id];

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <a href={routes.quizzes()}>Тесты</a>
        {section && (
          <>
            <span aria-hidden="true">›</span>
            <a href={routes.section(section.id)}>{section.title}</a>
          </>
        )}
      </nav>
      <h1>🧪 {quiz.title}</h1>
      {theory && (
        <p>
          <a href={pageHref(theory.id)}>📄 Теория по теме</a>
        </p>
      )}
      <QuizRunner
        items={quiz.questions.map((question, i) => ({ key: String(i), question }))}
        tasks={quiz.tasks}
        answers={progress?.answers ?? {}}
        solvedTasks={progress?.tasks ?? {}}
        onAnswer={(key, ok) => progressActions.setAnswer(quiz.id, key, ok)}
        onTaskSolved={(index, solved) => progressActions.setTask(quiz.id, String(index), solved)}
        onReset={() => progressActions.resetQuiz(quiz.id)}
        draftPrefix={quiz.id}
      />
    </div>
  );
}
