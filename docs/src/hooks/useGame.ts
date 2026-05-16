import { useState, useCallback, useRef } from 'react';
import type { GameMode, Monster, GuessRecord, DailySetupResponse, StreakData, GuessResult } from '../types';
import { buildGuessRecordFromFields } from '../utils/gameUtils';
import {
  apiFetchDailyMonster,
  apiFetchInfiniteMonster,
  apiFetchStreak,
  apiInsertAttempt,
  apiGuessDailyMonster,
} from '../services/api';
import { confirm } from '../components/common/ConfirmDialog';
import { showToast } from '../utils/toast';

const getTodayKeys = () => {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `deepwokendle_${today}`;
  return { cacheKey, dailyCountKey: `${cacheKey}_amountsGuessed`, answerKey: `${cacheKey}_answer` };
};

export function useGame() {
  const streakRef = useRef(0);
  const amountRef = useRef(0);
  const isDisabledRef = useRef(false);
  const isAwaitingRef = useRef(false);
  const targetNameRef = useRef('');

  const [mode, setMode] = useState<GameMode>('normal');
  const [randomCharacter, setRandomCharacter] = useState<Monster | null>(null);
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [amountsGuessed, setAmountsGuessed] = useState(0);
  const [infiniteStreak, setInfiniteStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [nextResetUtc, setNextResetUtc] = useState<Date | null>(null);
  const [alreadyGuessed, setAlreadyGuessed] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAwaitingNext, setIsAwaitingNext] = useState(false);
  const [infiniteResult, setInfiniteResult] = useState<'won' | 'lost' | null>(null);

  const setCharacter = (m: Monster | null) => setRandomCharacter(m);
  const setStreak = (v: number) => { streakRef.current = v; setInfiniteStreak(v); };
  const setAmount = (v: number) => { amountRef.current = v; setAmountsGuessed(v); };
  const setDisabled = (v: boolean) => { isDisabledRef.current = v; setIsDisabled(v); };
  const setAwaiting = (v: boolean) => { isAwaitingRef.current = v; setIsAwaitingNext(v); };

  const initNormalMode = useCallback(async (monsters: Monster[]) => {
    setIsLoading(true);
    setMode('normal');
    setGuesses([]);
    setAlreadyGuessed(false);
    setDisabled(false);
    setAwaiting(false);
    setCharacter(null);
    setInfiniteResult(null);

    try {
      const res = await apiFetchDailyMonster();
      if (!res.ok) throw new Error('Failed to fetch daily monster');
      const data: DailySetupResponse = await res.json();
      setNextResetUtc(new Date(data.nextResetUtc));

      const { cacheKey, dailyCountKey, answerKey } = getTodayKeys();
      const saved = localStorage.getItem(dailyCountKey);
      setAmount(saved != null ? parseInt(saved, 10) : 0);

      if (localStorage.getItem(cacheKey) === 'guessed') {
        setAlreadyGuessed(true);
        setDisabled(true);
        const savedAnswerId = localStorage.getItem(answerKey);
        if (savedAnswerId) {
          const answeredMonster = monsters.find(m => m.id === parseInt(savedAnswerId, 10));
          if (answeredMonster) setCharacter(answeredMonster);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initInfiniteMode = useCallback(async (monsters: Monster[]): Promise<boolean> => {
    setIsLoading(true);
    setMode('infinite');
    setGuesses([]);
    setAmount(0);
    setStreak(0);
    setDisabled(false);
    setAwaiting(false);
    setAlreadyGuessed(false);
    setCharacter(null);
    setInfiniteResult(null);

    try {
      const [monsterRes, streakRes] = await Promise.all([
        apiFetchInfiniteMonster(),
        apiFetchStreak(),
      ]);

      if (!monsterRes.ok || !streakRes.ok) return true;

      const streakData: StreakData = await streakRes.json();

      setStreak(streakData.streakAmmount ?? 0);
      setAmount(streakData.attemptsAmount ?? 0);

      const previous: GuessRecord[] = streakData.previousGuesses
        .map((pg, idx) => {
          const m = monsters.find(m => m.id === pg.monsterId);
          return m ? buildGuessRecordFromFields(m, pg.fields, idx + 1) : null;
        })
        .filter(Boolean) as GuessRecord[];

      setGuesses(previous.reverse());
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const guessCharacter = useCallback(async (monsterId: number, monsters: Monster[], currentMode: GameMode) => {
    if (isDisabledRef.current || isAwaitingRef.current) return;

    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return;

    const { cacheKey, dailyCountKey, answerKey } = getTodayKeys();

    let correct: boolean;
    let result: GuessResult;
    let newAmount: number;

    if (currentMode === 'normal') {
      newAmount = amountRef.current + 1;
      setAmount(newAmount);
      localStorage.setItem(dailyCountKey, String(newAmount));

      setIsLoading(true);
      try {
        const res = await apiGuessDailyMonster(monsterId, newAmount);
        if (!res.ok) return;
        result = await res.json() as GuessResult;
        correct = result.correct;
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await apiInsertAttempt({
          MonsterId: monsterId,
          GuessDate: new Date().toISOString().slice(0, 10),
          Infinite: true,
        });
        if (!res.ok) throw new Error('Failed to insert attempt');
        result = await res.json() as GuessResult;
        correct = result.correct;
        newAmount = result.attemptAmount ?? amountRef.current + 1;
        setAmount(newAmount);
        if (result.targetName) targetNameRef.current = result.targetName;
      } finally {
        setIsLoading(false);
      }
    }

    const record = buildGuessRecordFromFields(monster, result.fields, newAmount!);
    setGuesses(prev => [record, ...prev]);

    const SWAL_DELAY = 1500;

    if (correct) {
      if (currentMode === 'normal') {
        localStorage.setItem(cacheKey, 'guessed');
        localStorage.setItem(answerKey, String(monsterId));
        setCharacter(monster);
        setAlreadyGuessed(true);
        setDisabled(true);
        setTimeout(() => {
          showToast.success('You guessed it right! Come back tomorrow or try Infinite mode!');
        }, SWAL_DELAY);
      } else {
        setAwaiting(true);
        setTimeout(async () => {
          const goNext = await confirm({
            title: 'Correct!',
            message: 'Go to the next round?',
            confirmText: 'Yes!',
            cancelText: 'No!',
          });
          setStreak(streakRef.current + 1);
          if (goNext) {
            window.dispatchEvent(new CustomEvent('game:initInfinite'));
          } else {
            setInfiniteResult('won');
            setDisabled(true);
            setAwaiting(false);
          }
        }, SWAL_DELAY);
      }
    } else if (currentMode === 'infinite' && newAmount! >= 5) {
      setAwaiting(true);
      setTimeout(async () => {
        const charName = targetNameRef.current || '?';
        const tempStreak = streakRef.current;
        const tryAgain = await confirm({
          title: `You lost your streak of ${tempStreak}!`,
          message: `The character was ${charName}. Try again?`,
          confirmText: 'Yes!',
          cancelText: 'No!',
        });
        setStreak(0);
        if (tryAgain) {
          window.dispatchEvent(new CustomEvent('game:initInfinite'));
        } else {
          setInfiniteResult('lost');
          setDisabled(true);
          setAwaiting(false);
        }
      }, SWAL_DELAY);
    }
  }, []);

  return {
    mode,
    randomCharacter,
    guesses,
    amountsGuessed,
    infiniteStreak,
    isLoading,
    nextResetUtc,
    alreadyGuessed,
    isDisabled,
    isAwaitingNext,
    infiniteResult,
    initNormalMode,
    initInfiniteMode,
    guessCharacter,
  };
}
