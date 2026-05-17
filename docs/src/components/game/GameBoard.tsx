import { useEffect, useState } from 'react';
import GuessRow from './GuessRow';
import GuessInput from './GuessInput';
import type { GameMode, GuessRecord, Monster, SelectOption } from '../../types';
import Tooltip from '../common/Tooltip';
import { showToast } from '../../utils/toast';

interface Props {
  mode: GameMode;
  guesses: GuessRecord[];
  randomCharacter: Monster | null;
  amountsGuessed: number;
  infiniteStreak: number;
  isDisabled: boolean;
  isAwaitingNext: boolean;
  alreadyGuessed: boolean;
  nextResetUtc: Date | null;
  monsters: Monster[];
  infiniteResult: 'won' | 'lost' | null;
  onGuess: (monsterId: number) => void;
  onInitInfinite?: () => void;
}

function Timer({ nextResetUtc, show }: { nextResetUtc: Date | null; show: boolean }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!show || !nextResetUtc) return;
    const update = () => {
      const diff = nextResetUtc.getTime() - Date.now();
      if (diff <= 0) { setText('Character resetting soon...'); return; }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setText(`Character resetting in ${h}:${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextResetUtc, show]);

  if (!show) return null;
  return <div id="resetTimer" style={{ color: 'black', whiteSpace: 'nowrap' }}>{text}</div>;
}

const GAME_COPY_TEXT = (tries: number | string) =>
  `I just guessed today's Deepwokendle character in ${tries} tries!\nhttps://www.deepwokendle.com/`;

const GAME_TWITTER_TEXT = (tries: number | string) =>
  `${GAME_COPY_TEXT(tries)} #deepwoken #deepwokendle`;

export default function GameBoard({
  mode, guesses, randomCharacter, amountsGuessed, infiniteStreak,
  isDisabled, isAwaitingNext, alreadyGuessed, nextResetUtc, monsters, infiniteResult, onGuess, onInitInfinite,
}: Props) {
  const [selected, setSelected] = useState<SelectOption | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleGuess = () => {
    if (!selected) return;
    onGuess(selected.value);
  };

  const handleRetry = () => { if (onInitInfinite) onInitInfinite(); };

  const showAnswerRow = alreadyGuessed && randomCharacter && !guesses.some(g => g.monster.id === randomCharacter.id);

  const answerRecord = showAnswerRow && randomCharacter
    ? {
        monster: randomCharacter,
        fields: ['name', 'gives', 'element', 'category', 'locations', 'humanoid'].map(f => ({
          field: f,
          display:
            f === 'gives' ? randomCharacter.gives.join(', ')
            : f === 'locations' ? randomCharacter.locations.join(', ')
            : f === 'humanoid' ? (randomCharacter.humanoid ? '✓' : 'X')
            : (randomCharacter as any)[f],
          result: 'correct' as const,
        })),
        attemptNumber: 0,
      }
    : null;

  const showShare = mode === 'normal' && (isDisabled || alreadyGuessed);
  const tries = amountsGuessed > 0 ? amountsGuessed : '?';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GAME_COPY_TEXT(tries));
      showToast.success('Copied to clipboard!');
    } catch {
      showToast.error('Failed to copy.');
    }
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(GAME_TWITTER_TEXT(tries));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="game-border-wrapper border">
        <div className="mode-indicator">
          <Tooltip content={mode === 'normal' ? 'This mode is just for fun! It resets daily and does not affect the leaderboard or your streak.' : 'This mode is infinite! Your streak will continue until you miss 5 times in a row. This gamemode affects the leaderboard!'} placement="top">
            <span className={`mode-badge${mode === 'infinite' ? ' mode-infinite' : ' mode-normal'}`}>
              {mode === 'normal' ? 'Normal' : 'Infinite'}
            </span>
          </Tooltip>
          {mode === 'infinite' && (
            <span className="streak-badge">Streak: {infiniteStreak}</span>
          )}
        </div>
        <div id="attempts" className="rowsContainer">
          <div className="headerContainer">
            <div className="columns">
              {['Picture', 'Name', 'Gives', 'Element', 'Category', 'Locations', 'Humanoid'].map(col => (
                <div key={col} className="column">
                  <div className="column-title">{col}</div>
                </div>
              ))}
            </div>
          </div>

          {guesses.length === 0 && !answerRecord && (
            <div id="firstGuessText">Try to guess a character!</div>
          )}
          <div className="tempContainer" style={{ minHeight: guesses.length === 0 && !answerRecord ? 60 : 0 }} />

          {answerRecord && <GuessRow record={answerRecord} baseDelay={0} />}
          {guesses.map((record, i) => (
            <GuessRow key={record.attemptNumber} record={record} baseDelay={i * 500} />
          ))}
        </div>
      </div>

      <div className="center">
        <GuessInput monsters={monsters} value={selected} onChange={setSelected} disabled={isDisabled || isAwaitingNext} />
      </div>

      <div className="center">
        {isDisabled && mode === 'infinite' ? (
          <button className="btn border" onClick={handleRetry}>
            {infiniteResult === 'won' ? 'NEXT' : 'RETRY'}
          </button>
        ) : (
          <button
            className={`btn border${isDisabled || isAwaitingNext ? ' disabled' : ''}`}
            id="guessBtn"
            onClick={handleGuess}
            disabled={isDisabled || isAwaitingNext}
          >
            GUESS
          </button>
        )}
      </div>

      <div className="center">
        <Timer nextResetUtc={nextResetUtc} show={mode === 'normal' && alreadyGuessed} />
      </div>

      <div className="center">
        <div id="amountsGuessed" style={{ color: 'black', whiteSpace: 'nowrap' }}>
          {amountsGuessed > 0
            ? `Tries: ${amountsGuessed}/${mode === 'infinite' ? '5' : '∞'}`
            : ''}
        </div>
      </div>

      {showShare && (
        <button className="game-share-btn" onClick={() => setShareOpen(true)}>
          <i className="fas fa-share-nodes" /> Share
        </button>
      )}

      {shareOpen && (
        <div className="game-share-overlay" onClick={() => setShareOpen(false)}>
          <div className="game-share-modal border" onClick={e => e.stopPropagation()}>
            <p className="game-share-title">Share your result</p>
            <p className="game-share-text">{GAME_COPY_TEXT(tries)}</p>
            <div className="game-share-actions">
              <button className="game-share-icon-btn" onClick={handleCopy}>
                <i className="far fa-copy" /> Copy
              </button>
              <button className="game-share-icon-btn" onClick={handleTwitter}>
                <i className="fab fa-x-twitter" /> Post
              </button>
            </div>
            <button className="game-share-close" onClick={() => setShareOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
