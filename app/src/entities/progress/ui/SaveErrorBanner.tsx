import { useProgressSaveFailed } from '../model/store';

export function SaveErrorBanner() {
  const failed = useProgressSaveFailed();
  if (!failed) return null;
  return (
    <div className="save-error" role="alert">
      Не удалось сохранить прогресс: хранилище браузера переполнено или недоступно. Сделайте экспорт на главной, чтобы не потерять данные.
    </div>
  );
}
