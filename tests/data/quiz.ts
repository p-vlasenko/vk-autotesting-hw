interface QuizOption {
  readonly id: number;
  readonly text: string;
  readonly correct: boolean;
  readonly message: string;
}

interface QuizQuestion {
  readonly id: number;
  readonly text: string;
  readonly type: 'single' | 'multiple';
  readonly options: readonly QuizOption[];
}

export interface Quiz {
  readonly title: string;
  readonly description: string;
  readonly questions: readonly QuizQuestion[];
}

export function createQuiz(): Quiz {
  return {
    title: 'Основы веб-разработки',
    description: 'Учебный квиз для UI-автотестов',
    questions: [
      {
        id: 1,
        text: 'Какой язык отвечает за структуру страницы?',
        type: 'single',
        options: [
          { id: 1, text: 'HTML', correct: true, message: 'HTML задаёт структуру страницы.' },
          { id: 2, text: 'CSS', correct: false, message: 'CSS отвечает за оформление, а не структуру.' },
        ],
      },
      {
        id: 2,
        text: 'Какие элементы являются семантическими?',
        type: 'multiple',
        options: [
          { id: 1, text: 'header', correct: true, message: 'header обозначает вводную часть.' },
          { id: 2, text: 'main', correct: true, message: 'main обозначает основное содержимое.' },
          { id: 3, text: 'div', correct: false, message: 'div не несёт семантического значения.' },
        ],
      },
    ],
  };
}

export function questionCountText(quiz: Quiz): string {
  const count = quiz.questions.length;
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${String(count)} вопросов`;
  }
  if (lastDigit === 1) {
    return `${String(count)} вопрос`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${String(count)} вопроса`;
  }
  return `${String(count)} вопросов`;
}
