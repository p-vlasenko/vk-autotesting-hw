import { expect, type Locator } from '@playwright/test';

export type PageElement = {
  click(): Promise<void>;
  fill(text: string): Promise<void>;
  check(): Promise<void>;
  expectVisible(): Promise<void>;
  expectHidden(): Promise<void>;
  expectText(text: string): Promise<void>;
  expectTextSoft(text: string): Promise<void>;
  expectCount(count: number): Promise<void>;
};

export function createPageElement(locator: Locator): PageElement {
  return {
    async click() {
      await locator.click();
    },
    async fill(text) {
      await locator.fill(text);
    },
    async check() {
      await locator.check();
    },
    async expectVisible() {
      await expect(locator).toBeVisible();
    },
    async expectHidden() {
      await expect(locator).toBeHidden();
    },
    async expectText(text) {
      await expect(locator).toHaveText(text);
    },
    async expectTextSoft(text) {
      await expect.soft(locator).toHaveText(text);
    },
    async expectCount(count) {
      await expect(locator).toHaveCount(count);
    },
  };
}
