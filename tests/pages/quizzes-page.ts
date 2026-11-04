import { expect, type Page } from '@playwright/test';
import type { Quiz } from '../data/quiz.ts';

export type QuizzesPageObject = {
  expectQuiz(quiz: Quiz, questionCountText: string): Promise<void>;
  reload(): Promise<void>;
  startQuiz(title: string): Promise<void>;
};

export function createQuizzesPage(page: Page): QuizzesPageObject {
  const card = (title: string) => page.locator('.quiz-card').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });

  return {
    async expectQuiz(quiz, questionCountText) {
      await expect(page).toHaveURL(/\/quizzes\.html$/);
      await expect(card(quiz.title)).toHaveCount(1);
      await expect(card(quiz.title).locator('.quiz-card__description')).toHaveText(quiz.description);
      await expect(card(quiz.title).locator('.quiz-card__count')).toHaveText(questionCountText);
    },
    async reload() {
      await page.reload();
    },
    async startQuiz(title) {
      await card(title).getByRole('link', { name: 'Пройти', exact: true }).click();
      await expect(page).toHaveURL(/\/quiz\.html\?id=[^&]+(?:&question=1)?$/);
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    },
  };
}
