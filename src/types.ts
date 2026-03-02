export interface Question {
  id: string;
  text: string;
  correctAnswer: boolean; // true for thumbs up, false for thumbs down
}

export type GameState = 'START' | 'PLAYING' | 'FINISHED' | 'SETUP';
