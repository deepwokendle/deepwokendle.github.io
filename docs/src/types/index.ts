export interface Monster {
  id: number;
  name: string;
  picture: string;
  humanoid: boolean;
  mainHabitat: string;
  element: string;
  category: string;
  gives: string[];
  locations: string[];
}

export interface PreviousGuess {
  monsterId: number;
  fields: GuessField[];
}

export interface StreakData {
  streakAmmount: number;
  attemptsAmount: number;
  previousGuesses: PreviousGuess[];
}

export interface DailySetupResponse {
  nextResetUtc: string;
}

export interface GuessResult {
  correct: boolean;
  fields: GuessField[];
  attemptAmount?: number;
  targetName?: string;
}

export interface LeaderboardEntry {
  place: number;
  username: string;
  maxStreak: number;
}

export interface MonthlyEntry {
  place: number;
  username: string;
  score: number;
}

export interface ElementOption {
  id: number;
  name: string;
}

export interface SelectOption {
  value: number;
  label: string;
}

export interface MonsterAdmin {
  id: number;
  name: string;
  picture: string;
  humanoid: boolean;
  mainHabitat: string;
  pending: boolean;
  elementId: number;
  categoryId: number;
  element: string;
  category: string;
}

export interface MonsterEnriched {
  id: number;
  name: string;
  picture: string;
  humanoid: boolean;
  mainHabitat: string;
  elementId: number;
  categoryId: number;
  element: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
  lootPool: { monsterId: number; lootId: number; lootName: string }[];
  locationPool: { monsterId: number; locationId: number; name: string }[];
}

export interface NamedOption {
  id: number;
  name: string;
}

export interface MonsterSuggestion {
  id: number;
  name: string;
  picture: string;
  humanoid: boolean;
  pending: boolean;
  userAtCreation: string;
  createdAt: string;
  element: string;
  category: string;
  loots: string[];
  locations: string[];
  likeCount: number;
  dislikeCount: number;
  userVote: number | null;
  lastLikers: string[];
  lastDislikers: string[];
  updatedAt: string | null;
}

export type GameMode = 'normal' | 'infinite';
export type MatchResult = 'correct' | 'partial' | 'wrong';

export interface GuessField {
  field: string;
  display: string;
  result: MatchResult;
}

export interface GuessRecord {
  monster: Monster;
  fields: GuessField[];
  attemptNumber: number;
}
