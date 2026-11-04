import { expect, type Page } from '@playwright/test';

export type GeneratorPageObject = {
  open(): Promise<void>;
  /** Strings are submitted verbatim; other values are serialized as JSON. */
  addQuiz(quiz: unknown): Promise<void>;
  expectError(kind: 'parse' | 'structure'): Promise<void>;
  dismissError(): Promise<void>;
};

export function createGeneratorPage(page: Page): GeneratorPageObject {
  const input = page.locator('#quiz-json-input');
  const error = page.locator('.modal_error');

  return {
    async open() {
      await page.goto('./');
      await expect(page.getByRole('heading', { name: 'Генератор квизов', exact: true })).toBeVisible();
    },
    async addQuiz(quiz) {
      const json = typeof quiz === 'string' ? quiz : JSON.stringify(quiz);
      await input.fill(json);
      await page.getByRole('button', { name: 'Сгенерировать', exact: true }).click();
    },
    async expectError(kind) {
      await expect(error).toBeVisible();
      await expect(error.locator('.error__title')).toHaveText(
        kind === 'parse'
          ? 'Ошибка: не удалось обработать JSON.'
          : 'Ошибка: Неверная структура JSON.',
      );
      await expect(error.locator('.error__message')).toHaveText(
        'Проверьте формат данных и попробуйте снова.',
      );
      await expect(page).toHaveURL(/\/higher-web-practice-quiz-generator\/(?:index\.html)?$/);
    },
    async dismissError() {
      await error.getByRole('button', { name: 'Продолжить', exact: true }).click();
      await expect(error).toBeHidden();
      await expect(input).toBeVisible();
    },
  };
}
