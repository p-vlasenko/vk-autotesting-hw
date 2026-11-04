interface QuizOption {
  id: number;
  text: string;
  correct: boolean;
  message: string;
}

interface QuizQuestion {
  id: number;
  text: string;
  type: 'single' | 'multiple';
  options: QuizOption[];
}

export interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
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
