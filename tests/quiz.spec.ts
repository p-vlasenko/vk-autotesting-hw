import { test as it } from '@playwright/test';
import { createQuiz } from './data/quiz.ts';
import { createGeneratorPage } from './pages/generator-page.ts';
import type { QuizPageObject } from './pages/quiz-page.ts';

const { describe } = it;

describe('Генератор квизов', () => {
  it.beforeEach('Открыть генератор', async ({ page }) => {
    await createGeneratorPage(page).open();
  });

  it.afterEach('Приложить сведения о выполнении', async ({ page }, testInfo) => {
    await testInfo.attach('test-summary', {
      body: JSON.stringify({
        title: testInfo.title,
        status: testInfo.status,
        expectedStatus: testInfo.expectedStatus,
        url: page.url(),
      }, null, 2),
      contentType: 'application/json',
    });
  });

  describe('Валидация JSON', { tag: '@generator' }, () => {
    describe('Синтаксис', () => {
      const invalidJsonCases = [
        { name: 'произвольный текст', json: 'qwe' },
        { name: 'незакрытый объект', json: '{' },
        { name: 'поле без значения', json: '{"title":}' },
      ];

      for (const { name, json } of invalidJsonCases) {
        it(`${name} вызывает закрываемую ошибку обработки`, async ({ page }) => {
          const generator = createGeneratorPage(page);

          await generator.submitQuizData(json)
            .then(currentPage => currentPage.expectError('parse'))
            .then(currentPage => currentPage.dismissError());
        });
      }
    });

    describe('Структура', () => {
      it('JSON без title вызывает ошибку структуры', async ({ page }) => {
        const generator = createGeneratorPage(page);
        const { description, questions } = createQuiz();

        await generator.submitQuizData({ description, questions })
          .then(currentPage => currentPage.expectError('structure'));
      });
    });
  });

  describe('Список сохранённых квизов', { tag: '@storage' }, () => {
    it('созданный квиз сохраняется после перезагрузки', async ({ page }) => {
      const generator = createGeneratorPage(page);
      const quiz = createQuiz();

      const quizzes = await generator.addQuiz(quiz)
        .then(currentPage => currentPage.expectQuiz(quiz));
      await quizzes.reload()
        .then(currentPage => currentPage.expectQuiz(quiz));
    });

    // eslint-disable-next-line playwright/no-skipped-test -- Учебная демонстрация аналога @Disabled.
    it.skip('учебный пример: корректный JSON создаёт карточку квиза', {
      annotation: {
        type: 'skip',
        description: 'Учебная демонстрация аналога @Disabled; поведение покрыто активным тестом сохранения.',
      },
    }, async ({ page }) => {
      const generator = createGeneratorPage(page);
      const quiz = createQuiz();

      await generator.addQuiz(quiz)
        .then(currentPage => currentPage.expectQuiz(quiz));
    });
  });

  describe('Прохождение квиза', { tag: '@quiz' }, () => {
    it.describe.configure({ timeout: 60_000 });

    const scenarios: readonly {
      title: string;
      singleAnswer: string;
      multipleAnswers: readonly string[];
      explanation?: string;
      outcome: Parameters<QuizPageObject['expectResult']>[0];
    }[] = [
      {
        title: 'правильные ответы single и multiple дают максимальный результат',
        singleAnswer: 'HTML',
        multipleAnswers: ['header', 'main'],
        outcome: 'all-correct',
      },
      {
        title: 'ошибочный ответ single показывает пояснение и даёт результат 1 из 2',
        singleAnswer: 'CSS',
        multipleAnswers: ['header', 'main'],
        explanation: 'CSS отвечает за оформление, а не структуру.',
        outcome: 'one-correct',
      },
      {
        title: 'неполный правильный набор multiple даёт результат 1 из 2',
        singleAnswer: 'HTML',
        multipleAnswers: ['header'],
        outcome: 'one-correct',
      },
      {
        title: 'лишний неправильный вариант multiple даёт результат 1 из 2',
        singleAnswer: 'HTML',
        multipleAnswers: ['header', 'main', 'div'],
        outcome: 'one-correct',
      },
      {
        title: 'только неправильный вариант multiple даёт результат 1 из 2',
        singleAnswer: 'HTML',
        multipleAnswers: ['div'],
        outcome: 'one-correct',
      },
    ];

    for (const scenario of scenarios) {
      it(scenario.title, async ({ page }) => {
        const generator = createGeneratorPage(page);
        const quiz = createQuiz();

        const game = await generator.addQuiz(quiz)
          .then(currentPage => currentPage.expectQuiz(quiz))
          .then(currentPage => currentPage.startQuiz(quiz.title));
        await game.expectQuestion('Какой язык отвечает за структуру страницы?', 1, 2)
          .then(currentPage => currentPage.selectSingleAnswer(scenario.singleAnswer))
          .then(currentPage => currentPage.submitAnswer());

        // eslint-disable-next-line playwright/no-conditional-in-test -- Проверка пояснения предусмотрена только для ошибочного ответа в таблице.
        if (scenario.explanation !== undefined) {
          await game.expectExplanation(scenario.explanation);
        }

        await game.nextQuestion()
          .then(currentPage => currentPage.expectQuestion('Какие элементы являются семантическими?', 2, 2))
          .then(currentPage => currentPage.selectMultipleAnswers(scenario.multipleAnswers))
          .then(currentPage => currentPage.submitAnswer())
          .then(currentPage => currentPage.finish())
          .then(currentPage => currentPage.expectResult(scenario.outcome));
      });
    }
  });
});
