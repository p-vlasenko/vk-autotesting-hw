import { expect, type Page } from '@playwright/test';

export type QuizPageObject = {
  expectQuestion(text: string, current: number, total: number): Promise<void>;
  selectSingleAnswer(text: string): Promise<void>;
  selectMultipleAnswers(texts: readonly string[]): Promise<void>;
  submitAnswer(): Promise<void>;
  expectExplanation(text: string): Promise<void>;
  nextQuestion(): Promise<void>;
  finish(): Promise<void>;
  expectResult(outcome: 'all-correct' | 'one-correct'): Promise<void>;
};

export function createQuizPage(page: Page): QuizPageObject {
  const question = page.locator('.quiz__question');
  const result = page.locator('.quiz-result');

  return {
    async expectQuestion(text, current, total) {
      await expect(question.getByRole('heading', { name: text, exact: true })).toBeVisible();
      await expect(page.locator('.quiz__progress-text')).toHaveText(`Вопрос ${String(current)} из ${String(total)}`);
    },
    async selectSingleAnswer(text) {
      await question.getByRole('radio', { name: text, exact: true }).check();
    },
    async selectMultipleAnswers(texts) {
      for (const text of texts) {
        await question.getByRole('checkbox', { name: text, exact: true }).check();
      }
    },
    async submitAnswer() {
      await page.getByRole('button', { name: 'Ответить', exact: true }).click();
    },
    async expectExplanation(text) {
      await expect(question.getByText(text, { exact: true })).toBeVisible();
    },
    async nextQuestion() {
      await page.getByRole('button', { name: 'Следующий вопрос', exact: true }).click();
    },
    async finish() {
      await page.getByRole('button', { name: 'Завершить тест', exact: true }).click();
    },
    async expectResult(outcome) {
      await expect(result).toBeVisible();
      await expect(page.locator('.quiz')).toBeHidden();
      await expect(result.locator('.quiz-result__details')).toHaveText(
        outcome === 'all-correct'
          ? 'Вы ответили правильно на все вопросы 🎉'
          : 'Вы ответили правильно только на 1 из 2 вопросов.',
      );
    },
  };
}
