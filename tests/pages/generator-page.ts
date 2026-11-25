import { expect, type Page } from '@playwright/test';
import type { Quiz } from '../data/quiz.ts';
import type { LoadableComponent } from './loadable-component.ts';
import { createPageElement } from './page-element.ts';
import { createQuizzesPage, type QuizzesPageObject } from './quizzes-page.ts';

export type GeneratorPageObject = LoadableComponent<GeneratorPageObject> & {
  open(): Promise<GeneratorPageObject>;
  addQuiz(quiz: Quiz): Promise<QuizzesPageObject>;
  submitQuizData(data: unknown): Promise<GeneratorPageObject>;
  expectError(kind: 'parse' | 'structure'): Promise<GeneratorPageObject>;
  dismissError(): Promise<GeneratorPageObject>;
};

export function createGeneratorPage(page: Page): GeneratorPageObject {
  const input = createPageElement(page.locator('#quiz-json-input'));
  const generateButton = createPageElement(page.getByRole('button', { name: 'Сгенерировать', exact: true }));
  const heading = createPageElement(page.getByRole('heading', { name: 'Генератор квизов', exact: true }));
  const errorLocator = page.locator('.modal_error');
  const error = createPageElement(errorLocator);
  const errorTitle = createPageElement(errorLocator.locator('.error__title'));
  const errorMessage = createPageElement(errorLocator.locator('.error__message'));
  const continueButton = createPageElement(
    errorLocator.getByRole('button', { name: 'Продолжить', exact: true }),
  );

  const generator: GeneratorPageObject = {
    async waitForLoaded() {
      await heading.expectVisible();
      await input.expectVisible();
      await page.evaluate(async () => {
        const entryScript = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
        if (entryScript === null) {
          throw new Error('Generator entry module was not found.');
        }

        // The same URL reuses the script's module record; import() also waits for top-level await.
        await import(entryScript.src);
      });
      return generator;
    },
    async open() {
      await page.goto('./');
      return generator.waitForLoaded();
    },
    async addQuiz(quiz) {
      await generator.submitQuizData(quiz);
      return createQuizzesPage(page).waitForLoaded();
    },
    async submitQuizData(data) {
      const json = typeof data === 'string' ? data : JSON.stringify(data);
      await input.fill(json);
      await generateButton.click();
      return generator;
    },
    async expectError(kind) {
      await error.expectVisible();
      await errorTitle.expectText(
        kind === 'parse'
          ? 'Ошибка: не удалось обработать JSON.'
          : 'Ошибка: Неверная структура JSON.',
      );
      await errorMessage.expectText('Проверьте формат данных и попробуйте снова.');
      await expect(page).toHaveURL(/\/higher-web-practice-quiz-generator\/(?:index\.html)?$/);
      return generator;
    },
    async dismissError() {
      await continueButton.click();
      await error.expectHidden();
      return generator.waitForLoaded();
    },
  };

  return generator;
}
