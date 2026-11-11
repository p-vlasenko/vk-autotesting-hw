import { test as it } from '@playwright/test';
import { createQuiz } from './data/quiz.ts';
import { createGeneratorPage } from './pages/generator-page.ts';
import { createQuizPage, type QuizPageObject } from './pages/quiz-page.ts';
import { createQuizzesPage } from './pages/quizzes-page.ts';

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

          await generator.addQuiz(json);
          await generator.expectError('parse');
          await generator.dismissError();
        });
      }
    });

    describe('Структура', () => {
      it('JSON без title вызывает ошибку структуры', async ({ page }) => {
        const generator = createGeneratorPage(page);
        const { description, questions } = createQuiz();

        await generator.addQuiz({ description, questions });
        await generator.expectError('structure');
      });
    });
  });

  describe('Список сохранённых квизов', { tag: '@storage' }, () => {
    it('созданный квиз сохраняется после перезагрузки', async ({ page }) => {
      const generator = createGeneratorPage(page);
      const quizzes = createQuizzesPage(page);
      const quiz = createQuiz();

      await generator.addQuiz(quiz);
      await quizzes.expectQuiz(quiz, '2 вопроса');
      await quizzes.reload();
      await quizzes.expectQuiz(quiz, '2 вопроса');
    });

    // eslint-disable-next-line playwright/no-skipped-test -- Учебная демонстрация аналога @Disabled.
    it.skip('учебный пример: корректный JSON создаёт карточку квиза', {
      annotation: {
        type: 'skip',
        description: 'Учебная демонстрация аналога @Disabled; поведение покрыто активным тестом сохранения.',
      },
    }, async ({ page }) => {
      const generator = createGeneratorPage(page);
      const quizzes = createQuizzesPage(page);
      const quiz = createQuiz();

      await generator.addQuiz(quiz);
      await quizzes.expectQuiz(quiz, '2 вопроса');
    });
  });

  describe('Прохождение квиза', { tag: '@quiz' }, () => {
    it.describe.configure({ timeout: 60_000 });

    const scenarios: readonly {
      title: string;
      singleAnswer: string;
      explanation?: string;
      outcome: Parameters<QuizPageObject['expectResult']>[0];
    }[] = [
      {
        title: 'правильные ответы single и multiple дают максимальный результат',
        singleAnswer: 'HTML',
        outcome: 'all-correct',
      },
      {
        title: 'ошибочный ответ показывает пояснение и даёт результат 1 из 2',
        singleAnswer: 'CSS',
        explanation: 'CSS отвечает за оформление, а не структуру.',
        outcome: 'one-correct',
      },
    ];

    for (const scenario of scenarios) {
      it(scenario.title, async ({ page }) => {
        const generator = createGeneratorPage(page);
        const quizzes = createQuizzesPage(page);
        const game = createQuizPage(page);
        const quiz = createQuiz();

        await generator.addQuiz(quiz);
        await quizzes.expectQuiz(quiz, '2 вопроса');
        await quizzes.startQuiz(quiz.title);
        await game.expectQuestion('Какой язык отвечает за структуру страницы?', 1, 2);
        await game.selectSingleAnswer(scenario.singleAnswer);
        await game.submitAnswer();

        // eslint-disable-next-line playwright/no-conditional-in-test -- Проверка пояснения предусмотрена только для ошибочного ответа в таблице.
        if (scenario.explanation !== undefined) {
          await game.expectExplanation(scenario.explanation);
        }

        await game.nextQuestion();
        await game.expectQuestion('Какие элементы являются семантическими?', 2, 2);
        await game.selectMultipleAnswers(['header', 'main']);
        await game.submitAnswer();
        await game.finish();
        await game.expectResult(scenario.outcome);
      });
    }
  });
});
