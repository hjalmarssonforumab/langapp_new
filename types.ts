
export interface GameContent {
  id: string;
  word: string;        // The full word (e.g. "Sjukhus")
  highlight: string;   // The part to color red (e.g. "Sj")
  phonemeDisplay: string; // Text for the game button (e.g. "sj", "tj", "ng")
  distractors: string[]; // List of wrong options (e.g. ["tj", "rs", "sch"])
  image: string;       // Emoji string OR Base64/URL for image
  isImageFile: boolean; // True if 'image' is a URL/Base64, False if emoji
  audioBlob: Blob | null;
  category: string;
  language: string;    // e.g., 'sv-SE', 'ru-RU', 'en-US'
}

export interface WordChallenge {
  fullWord: string;
  prefix: string;
  highlight: string;
  suffix: string;
  correctPhoneme: string;
  englishTranslation: string;
}

export interface ParsedWord {
  fullWord: string;
  prefix: string;
  highlight: string;
  suffix: string;
}

export type ExerciseType = 'PHONEME' | 'MATCHING' | 'SPELLING';
export type MatchingDifficulty = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
export type SpellingDifficulty = 'LEVEL_1' | 'LEVEL_2';

export interface ExerciseConfig {
  id: string;
  type: ExerciseType;
  wordIds: string[]; // The specific IDs of words selected for this round
  difficulty?: MatchingDifficulty | SpellingDifficulty; // Union of difficulty types
}
