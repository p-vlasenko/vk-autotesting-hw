import { test as it } from '@playwright/test';
import { createQuiz } from './data/quiz.ts';
import { createGeneratorPage } from './pages/generator-page.ts';
import { createQuizPage } from './pages/quiz-page.ts';
import { createQuizzesPage } from './pages/quizzes-page.ts';

const { describe } = it;

describe('Генератор квизов', () => {
  it('некорректный JSON вызывает закрываемую ошибку обработки', async ({ page }) => {
    const generator = createGeneratorPage(page);

    await generator.open();
    await generator.addQuiz('qwe');
    await generator.expectError('parse');
    await generator.dismissError();
  });

  it('JSON без title вызывает ошибку структуры', async ({ page }) => {
    const generator = createGeneratorPage(page);
    const { description, questions } = createQuiz();

    await generator.open();
    await generator.addQuiz({ description, questions });
    await generator.expectError('structure');
  });
});

describe('Список сохранённых квизов', () => {
  it('созданный квиз сохраняется после перезагрузки', async ({ page }) => {
    const generator = createGeneratorPage(page);
    const quizzes = createQuizzesPage(page);
    const quiz = createQuiz();

    await generator.open();
    await generator.addQuiz(quiz);
    await quizzes.expectQuiz(quiz, '2 вопроса');
    await quizzes.reload();
    await quizzes.expectQuiz(quiz, '2 вопроса');
  });
});

describe('Прохождение квиза', () => {
  it('правильные ответы single и multiple дают максимальный результат', async ({ page }) => {
    const generator = createGeneratorPage(page);
    const quizzes = createQuizzesPage(page);
    const game = createQuizPage(page);
    const quiz = createQuiz();

    await generator.open();
    await generator.addQuiz(quiz);
    await quizzes.expectQuiz(quiz, '2 вопроса');
    await quizzes.startQuiz(quiz.title);
    await game.expectQuestion('Какой язык отвечает за структуру страницы?', 1, 2);
    await game.selectSingleAnswer('HTML');
    await game.submitAnswer();
    await game.nextQuestion();
    await game.expectQuestion('Какие элементы являются семантическими?', 2, 2);
    await game.selectMultipleAnswers(['header', 'main']);
    await game.submitAnswer();
    await game.finish();
    await game.expectResult('all-correct');
  });

  it('ошибочный ответ показывает пояснение и даёт результат 1 из 2', async ({ page }) => {
    const generator = createGeneratorPage(page);
    const quizzes = createQuizzesPage(page);
    const game = createQuizPage(page);
    const quiz = createQuiz();

    await generator.open();
    await generator.addQuiz(quiz);
    await quizzes.expectQuiz(quiz, '2 вопроса');
    await quizzes.startQuiz(quiz.title);
    await game.expectQuestion('Какой язык отвечает за структуру страницы?', 1, 2);
    await game.selectSingleAnswer('CSS');
    await game.submitAnswer();
    await game.expectExplanation('CSS отвечает за оформление, а не структуру.');
    await game.nextQuestion();
    await game.expectQuestion('Какие элементы являются семантическими?', 2, 2);
    await game.selectMultipleAnswers(['header', 'main']);
    await game.submitAnswer();
    await game.finish();
    await game.expectResult('one-correct');
  });
});
