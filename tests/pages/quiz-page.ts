import { expect, type Page } from '@playwright/test';
import type { LoadableComponent } from './loadable-component.ts';
import { createPageElement } from './page-element.ts';

export type QuizPageObject = LoadableComponent<QuizPageObject> & {
  expectQuestion(text: string, current: number, total: number): Promise<QuizPageObject>;
  selectSingleAnswer(text: string): Promise<QuizPageObject>;
  selectMultipleAnswers(texts: readonly string[]): Promise<QuizPageObject>;
  submitAnswer(): Promise<QuizPageObject>;
  expectExplanation(text: string): Promise<QuizPageObject>;
  nextQuestion(): Promise<QuizPageObject>;
  finish(): Promise<QuizPageObject>;
  expectResult(outcome: 'all-correct' | 'one-correct'): Promise<QuizPageObject>;
};

export function createQuizPage(page: Page): QuizPageObject {
  const questionLocator = page.locator('.quiz__question');
  const question = createPageElement(questionLocator);
  const progress = createPageElement(page.locator('.quiz__progress-text'));
  const result = createPageElement(page.locator('.quiz-result'));
  const quiz = createPageElement(page.locator('.quiz'));
  const resultDetails = createPageElement(page.locator('.quiz-result__details'));
  const submitButton = createPageElement(page.getByRole('button', { name: 'Ответить', exact: true }));
  const nextButton = createPageElement(page.getByRole('button', { name: 'Следующий вопрос', exact: true }));
  const finishButton = createPageElement(page.getByRole('button', { name: 'Завершить тест', exact: true }));

  const quizPage: QuizPageObject = {
    async waitForLoaded() {
      await question.expectVisible();
      return quizPage;
    },
    async expectQuestion(text, current, total) {
      await createPageElement(questionLocator.getByRole('heading', { name: text, exact: true })).expectVisible();
      await progress.expectText(`Вопрос ${String(current)} из ${String(total)}`);
      return quizPage;
    },
    async selectSingleAnswer(text) {
      await createPageElement(questionLocator.getByRole('radio', { name: text, exact: true })).check();
      return quizPage;
    },
    async selectMultipleAnswers(texts) {
      for (const text of texts) {
        await createPageElement(questionLocator.getByRole('checkbox', { name: text, exact: true })).check();
      }
      return quizPage;
    },
    async submitAnswer() {
      await submitButton.click();
      return quizPage;
    },
    async expectExplanation(text) {
      await createPageElement(questionLocator.getByText(text, { exact: true })).expectVisible();
      return quizPage;
    },
    async nextQuestion() {
      await nextButton.click();
      return quizPage.waitForLoaded();
    },
    async finish() {
      await finishButton.click();
      return quizPage;
    },
    async expectResult(outcome) {
      await result.expectVisible();
      await quiz.expectHidden();
      await resultDetails.expectText(
        outcome === 'all-correct'
          ? 'Вы ответили правильно на все вопросы 🎉'
          : 'Вы ответили правильно только на 1 из 2 вопросов.',
      );
      await expect(page).toHaveURL(/\/quiz\.html\?id=[^&]+/);
      return quizPage;
    },
  };

  return quizPage;
}
