import type { MatchResult, Monster, GuessField, GuessRecord } from '../types';

export const buildGuessRecordFromFields = (
  guessed: Monster,
  fields: GuessField[],
  attemptNumber: number,
): GuessRecord => ({ monster: guessed, fields, attemptNumber });

export const compareLocations = (correct: string[], guessed: string[]): MatchResult => {
  const correctSet = new Set(correct);
  const guessSet = new Set(guessed);
  if (guessSet.size === correctSet.size && [...guessSet].every(l => correctSet.has(l))) return 'correct';
  if ([...guessSet].some(l => correctSet.has(l))) return 'partial';
  return 'wrong';
};

export const compareSets = (correct: string[], guessed: string[]): MatchResult => {
  const correctSet = new Set(correct);
  const guessSet = new Set(guessed);
  const intersection = [...guessSet].filter(x => correctSet.has(x)).length;
  if (intersection === correctSet.size && guessSet.size === correctSet.size) return 'correct';
  if (intersection > 0) return 'partial';
  return 'wrong';
};

export const buildGuessRecord = (
  guessed: Monster,
  target: Monster,
  attemptNumber: number,
): GuessRecord => {
  const fields: GuessField[] = [
    {
      field: 'name',
      display: guessed.name,
      result: guessed.name === target.name ? 'correct' : 'wrong',
    },
    {
      field: 'gives',
      display: guessed.gives.join(', '),
      result: compareSets(target.gives, guessed.gives),
    },
    {
      field: 'element',
      display: guessed.element,
      result: guessed.element === target.element ? 'correct' : 'wrong',
    },
    {
      field: 'category',
      display: guessed.category,
      result: guessed.category === target.category ? 'correct' : 'wrong',
    },
    {
      field: 'locations',
      display: guessed.locations.join(', '),
      result: compareLocations(target.locations, guessed.locations),
    },
    {
      field: 'humanoid',
      display: guessed.humanoid ? '✓' : 'X',
      result: guessed.humanoid === target.humanoid ? 'correct' : 'wrong',
    },
  ];
  return { monster: guessed, fields, attemptNumber };
};
