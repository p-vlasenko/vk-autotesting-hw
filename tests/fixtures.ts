import { test as base } from '@playwright/test';
import { createGeneratorPage, type GeneratorPageObject } from './pages/generator-page.ts';

export const test = base.extend<{ generator: GeneratorPageObject }>({
  generator: async ({ page }, use) => {
    await use(createGeneratorPage(page));
  },
});
