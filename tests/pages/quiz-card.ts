import type { Page } from '@playwright/test';
import { questionCountText, type Quiz } from '../data/quiz.ts';
import type { LoadableComponent } from './loadable-component.ts';
import { createPageElement } from './page-element.ts';

export type QuizCardComponent = LoadableComponent<QuizCardComponent> & {
  expectContent(quiz: Quiz): Promise<QuizCardComponent>;
  start(): Promise<void>;
};

export function createQuizCard(page: Page, title: string): QuizCardComponent {
  const locator = page.locator('.quiz-card').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });
  const card = createPageElement(locator);
  const heading = createPageElement(locator.getByRole('heading', { name: title, exact: true }));
  const description = createPageElement(locator.locator('.quiz-card__description'));
  const questionCount = createPageElement(locator.locator('.quiz-card__count'));
  const startLink = createPageElement(locator.getByRole('link', { name: 'Пройти', exact: true }));

  const component: QuizCardComponent = {
    async waitForLoaded() {
      await card.expectCount(1);
      await heading.expectVisible();
      return component;
    },
    async expectContent(quiz) {
      await component.waitForLoaded();
      await description.expectTextSoft(quiz.description);
      await questionCount.expectTextSoft(questionCountText(quiz));
      return component;
    },
    async start() {
      await startLink.click();
    },
  };

  return component;
}
