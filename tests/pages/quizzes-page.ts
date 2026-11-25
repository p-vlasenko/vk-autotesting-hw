import { expect, test, type Page } from '@playwright/test';
import type { Quiz } from '../data/quiz.ts';
import type { LoadableComponent } from './loadable-component.ts';
import { createPageElement } from './page-element.ts';
import { createQuizCard } from './quiz-card.ts';
import { createQuizPage, type QuizPageObject } from './quiz-page.ts';

export type QuizzesPageObject = LoadableComponent<QuizzesPageObject> & {
  expectQuiz(quiz: Quiz): Promise<QuizzesPageObject>;
  reload(): Promise<QuizzesPageObject>;
  startQuiz(title: string): Promise<QuizPageObject>;
};

export function createQuizzesPage(page: Page): QuizzesPageObject {
  const firstCard = createPageElement(page.locator('.quiz-card').first());

  const quizzes: QuizzesPageObject = {
    async waitForLoaded() {
      await expect(page).toHaveURL(/\/quizzes\.html$/);
      await firstCard.expectVisible();
      return quizzes;
    },
    async expectQuiz(quiz) {
      await createQuizCard(page, quiz.title).expectContent(quiz);
      return quizzes;
    },
    async reload() {
      return test.step('Перезагрузить список квизов', async () => {
        await page.reload();
        return quizzes.waitForLoaded();
      }, { box: true });
    },
    async startQuiz(title) {
      return test.step(`Начать прохождение квиза «${title}»`, async () => {
        await createQuizCard(page, title).start();
        await expect(page).toHaveURL(/\/quiz\.html\?id=[^&]+(?:&question=1)?$/);
        await createPageElement(page.getByRole('heading', { name: title, exact: true })).expectVisible();
        return createQuizPage(page).waitForLoaded();
      }, { box: true });
    },
  };

  return quizzes;
}
