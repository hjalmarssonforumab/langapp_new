
import React, { useState, useEffect } from 'react';
import { GameContent, WordChallenge } from '../types';
import WordDisplay from './WordDisplay';
import { CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import { useGameSession } from '../hooks/useGameSession';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import GameHeader from './ui/GameHeader';

interface PhonemeGameProps {
  content: GameContent[];
  onComplete: (scoreToAdd: number) => void;
  onExit: () => void;
}

const DEFAULT_DISTRACTORS = ['sj', 'tj', 'sk', 'ng'];

const PhonemeGame: React.FC<PhonemeGameProps> = ({ content, onComplete, onExit }) => {
  const { currentItem, currentIndex, queue, addScore, nextItem, progress, sessionScore } = useGameSession({ content, onComplete });
  const { isPlaying, playAudio } = useAudioPlayer();

  // Local turn state
  const [hasGuessed, setHasGuessed] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  
  const TARGET_CORRECT_ANSWERS = 5;

  // Prepare Options
  useEffect(() => {
      if (!currentItem) return;

      let options: string[] = [];
      if (currentItem.distractors?.length > 0) {
          options = [...currentItem.distractors, currentItem.phonemeDisplay];
      } else {
          // Fallback generator
          const otherPhonemes = Array.from(new Set(content.map(c => c.phonemeDisplay)))
                                     .filter(p => p !== currentItem.phonemeDisplay);
          let fillers = otherPhonemes.length ? otherPhonemes : DEFAULT_DISTRACTORS.filter(d => d !== currentItem.phonemeDisplay);
          options = [...fillers.sort(() => Math.random() - 0.5).slice(0, 2), currentItem.phonemeDisplay];
      }

      setCurrentOptions(options.sort(() => Math.random() - 0.5));
      setHasGuessed(false);
      setLastGuessCorrect(null);
  }, [currentItem, content]);

  // Completion Check
  useEffect(() => {
    if (correctAnswersCount >= TARGET_CORRECT_ANSWERS) {
        setTimeout(() => onComplete(sessionScore), 1500);
    }
  }, [correctAnswersCount, onComplete, sessionScore]);

  const handleGuess = (guessedPhoneme: string) => {
    if (hasGuessed || !currentItem) return;

    const isCorrect = currentItem.phonemeDisplay === guessedPhoneme;
    setHasGuessed(true);
    setLastGuessCorrect(isCorrect);
    
    if (isCorrect) {
      addScore(1);
      setCorrectAnswersCount(c => c + 1);
    }
    playAudio(currentItem.audioBlob);
  };

  if (!currentItem) return <div className="p-8 text-center text-slate-500">No words available.</div>;

  if (correctAnswersCount >= TARGET_CORRECT_ANSWERS) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse">
              <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
              <h2 className="text-3xl font-bold text-slate-800">Exercise Complete!</h2>
          </div>
      );
  }

  const prefix = currentItem.word.substring(0, currentItem.word.indexOf(currentItem.highlight));
  const suffix = currentItem.word.substring(currentItem.word.indexOf(currentItem.highlight) + currentItem.highlight.length);

  const challengeDisplay: WordChallenge = {
      fullWord: currentItem.word,
      prefix: prefix || "",
      highlight: currentItem.highlight || currentItem.word,
      suffix: suffix || "",
      correctPhoneme: currentItem.phonemeDisplay,
      englishTranslation: ""
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <GameHeader 
        title="Phoneme Training" 
        progress={progress} 
        score={correctAnswersCount} 
        total={TARGET_CORRECT_ANSWERS} 
        onExit={onExit}
      />

      <div className="w-full">
         <WordDisplay 
           challenge={challengeDisplay} 
           onPlayAudio={() => playAudio(currentItem.audioBlob)}
           isPlaying={isPlaying}
         />
      </div>

      {/* Feedback */}
      <div className="h-12 flex items-center justify-center w-full">
        {hasGuessed && (
          <div className={`flex items-center gap-2 text-lg font-bold animate-in fade-in zoom-in duration-300 ${lastGuessCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {lastGuessCorrect ? <><CheckCircle2 size={28} /><span>Correct!</span></> : <><XCircle size={28} /><span>Incorrect, it was "{currentItem.phonemeDisplay}"</span></>}
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {currentOptions.map((p, idx) => {
           let btnColorClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
           if (hasGuessed) {
              if (p === currentItem.phonemeDisplay) {
                  btnColorClass = "bg-green-100 border-green-500 text-green-800 ring-4 ring-green-200 scale-105 shadow-lg z-10";
              } else {
                  btnColorClass = "bg-slate-50 border-slate-200 text-slate-300 opacity-40 scale-95";
              }
           }
           return (
            <button
              key={`${p}-${idx}`}
              onClick={() => handleGuess(p)}
              disabled={hasGuessed}
              className={`
                h-24 rounded-2xl border-b-4 text-3xl font-bold flex items-center justify-center shadow-sm transition-all duration-300
                ${btnColorClass}
                ${!hasGuessed ? 'active:border-b-0 active:translate-y-1 active:shadow-none' : 'cursor-default'}
              `}
            >
              {p}
            </button>
          );
        })}
      </div>

      {hasGuessed && (
        <button onClick={nextItem} className="mt-4 flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-colors hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-2">
          Next Word <RotateCw size={18} />
        </button>
      )}
    </div>
  );
};

export default PhonemeGame;
