import { routes } from '@/shared/config';

export function NotFound() {
  return (
    <div className="page">
      <h1>Страница не найдена</h1>
      <p className="muted">
        Возможно, тема ещё не написана или ссылка устарела. <a href={routes.home()}>На главную</a>
      </p>
    </div>
  );
}
