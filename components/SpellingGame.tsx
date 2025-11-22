
import React, { useState, useEffect, useRef } from 'react';
import { GameContent, SpellingDifficulty } from '../types';
import { Volume2, CheckCircle2, AlertTriangle, ArrowRight, XCircle, Keyboard, Ear, HelpCircle } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import GameHeader from './ui/GameHeader';

interface SpellingGameProps {
  content: GameContent[];
  difficulty?: SpellingDifficulty;
  onComplete: (scoreToAdd: number) => void;
  onExit: () => void;
}

type GameStatus = 'IDLE' | 'WARNING' | 'SUCCESS' | 'FAILED';

const SpellingGame: React.FC<SpellingGameProps> = ({ content, difficulty = 'LEVEL_1', onComplete, onExit }) => {
  const { currentItem, currentIndex, queue, addScore, nextItem, progress } = useGameSession({ content, onComplete });
  const { isPlaying, playAudio } = useAudioPlayer();

  const [userInput, setUserInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const inputRef = useRef<HTMLInputElement>(null);

  // Init new word
  useEffect(() => {
    if (currentItem) {
      setUserInput('');
      setAttempts(0);
      setStatus('IDLE');
      setTimeout(() => {
          playAudio(currentItem.audioBlob);
          inputRef.current?.focus();
      }, 500);
    }
  }, [currentItem, playAudio]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (status === 'SUCCESS' || status === 'FAILED') {
        nextItem();
        return;
    }
    
    if (!currentItem || !userInput.trim()) return;

    const cleanWord = currentItem.word.replace(/[\[\]]/g, '').trim().toLowerCase();
    const guess = userInput.trim().toLowerCase();

    if (guess === cleanWord) {
      setStatus('SUCCESS');
      // Bonus for first attempt
      addScore(attempts === 0 ? 2 : 1);
      playAudio(currentItem.audioBlob);
    } else {
      if (attempts === 0) {
        setAttempts(1);
        setStatus('WARNING');
      } else {
        setStatus('FAILED');
      }
    }
  };

  if (!currentItem) return <div className="p-8 text-center">Loading...</div>;

  const showVisual = difficulty === 'LEVEL_1' || status === 'SUCCESS' || status === 'FAILED';

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
      <GameHeader 
        title="Spelling Practice" 
        subtitle={`Word ${currentIndex + 1} of ${queue.length}`}
        progress={progress} 
        onExit={onExit}
      >
         <Keyboard size={20} className="text-orange-500" />
      </GameHeader>

      {/* Visual/Audio Card */}
      <button
        onClick={() => {
            playAudio(currentItem.audioBlob);
            inputRef.current?.focus();
        }}
        className={`
          relative group aspect-square w-48 rounded-2xl bg-white border-2 border-slate-200 shadow-lg 
          flex items-center justify-center overflow-hidden transition-all
          hover:border-blue-400 hover:scale-105
          ${isPlaying ? 'ring-4 ring-blue-100 border-blue-400' : ''}
        `}
      >
        {showVisual ? (
            currentItem.isImageFile ? (
                <img src={currentItem.image} alt="Word" className="w-full h-full object-cover" />
            ) : (
                <span className="text-8xl">{currentItem.image}</span>
            )
        ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
                <HelpCircle size={64} className="mb-2 opacity-50" />
                <span className="text-xs font-bold uppercase tracking-widest">Listen Only</span>
            </div>
        )}
        
        <div className="absolute bottom-2 right-2 flex items-center justify-center">
             <div className={`p-2 rounded-full text-slate-700 shadow-sm backdrop-blur-sm transition-colors ${isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-white/80 hover:bg-white'}`}>
                <Volume2 size={20} className={isPlaying ? 'animate-pulse' : ''} />
             </div>
        </div>
      </button>

      {/* Feedback */}
      <div className="h-8 w-full flex items-center justify-center">
         {status === 'WARNING' && <div className="flex items-center gap-2 text-orange-500 font-bold animate-bounce"><AlertTriangle size={18} /> Try Again! One chance left.</div>}
         {status === 'SUCCESS' && <div className="flex items-center gap-2 text-green-600 font-bold"><CheckCircle2 size={18} /> Correct!</div>}
         {status === 'FAILED' && <div className="flex items-center gap-2 text-red-500 font-bold"><XCircle size={18} /> Incorrect.</div>}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => { if (status !== 'SUCCESS' && status !== 'FAILED') setUserInput(e.target.value); }}
            disabled={status === 'SUCCESS' || status === 'FAILED'}
            placeholder="Type what you hear..."
            className={`
                w-full px-6 py-4 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                ${status === 'IDLE' ? 'border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' : ''}
                ${status === 'WARNING' ? 'border-orange-300 bg-orange-50 text-orange-800 focus:border-orange-500' : ''}
                ${status === 'SUCCESS' ? 'border-green-500 bg-green-50 text-green-800' : ''}
                ${status === 'FAILED' ? 'border-red-300 bg-red-50 text-red-400 line-through' : ''}
            `}
            autoComplete="off"
        />

        {status === 'FAILED' && (
            <div className="bg-white border-2 border-green-200 text-green-700 p-4 rounded-xl text-center font-extrabold text-2xl shadow-sm animate-in zoom-in-95">
                {currentItem.word.replace(/[\[\]]/g, '').trim()}
            </div>
        )}

        <button
            type="submit"
            className={`
                w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2
                ${status === 'SUCCESS' ? 'bg-green-600 hover:bg-green-700 text-white' : status === 'FAILED' ? 'bg-slate-800 hover:bg-slate-900 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
            `}
        >
            {status === 'SUCCESS' || status === 'FAILED' ? <>Next Word <ArrowRight size={20}/></> : <>Check Answer</>}
        </button>
      </form>

      <button type="button" onClick={onExit} className="text-slate-400 hover:text-slate-600 text-sm font-semibold uppercase tracking-wider mt-4">
        Quit Exercise
      </button>
    </div>
  );
};

export default SpellingGame;
