
import React, { useState, useEffect, useMemo } from 'react';
import { GameContent, WordChallenge } from '../types';
import WordDisplay from './WordDisplay';
import { Trophy, CheckCircle2, XCircle, RotateCw, Home } from 'lucide-react';

interface PhonemeGameProps {
  content: GameContent[];
  onComplete: (scoreToAdd: number) => void;
  onExit: () => void;
}

const DEFAULT_DISTRACTORS = ['sj', 'tj', 'sk', 'ng'];

const PhonemeGame: React.FC<PhonemeGameProps> = ({ content, onComplete, onExit }) => {
  const [queue, setQueue] = useState<GameContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  
  // Game State for current question
  const [hasGuessed, setHasGuessed] = useState(false);
  const [lastGuessCorrect, setLastGuessCorrect] = useState<boolean | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  
  const TARGET_CORRECT_ANSWERS = 5;

  // Shuffle content on mount
  useEffect(() => {
    const shuffled = [...content].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setCurrentIndex(0);
    setCorrectAnswersCount(0);
    setSessionScore(0);
  }, [content]);

  const currentItem = queue[currentIndex];

  // Setup options for the current word
  useEffect(() => {
      if (!currentItem) return;

      let options: string[] = [];

      if (currentItem.distractors && currentItem.distractors.length > 0) {
          // Use user-defined distractors
          options = [...currentItem.distractors, currentItem.phonemeDisplay];
      } else {
          // Fallback: If no distractors defined, try to pick from other words in the set OR use defaults
          const otherPhonemes = Array.from(new Set(content.map(c => c.phonemeDisplay)))
                                     .filter(p => p !== currentItem.phonemeDisplay);
          
          let fillers = otherPhonemes;
          if (fillers.length === 0) fillers = DEFAULT_DISTRACTORS.filter(d => d !== currentItem.phonemeDisplay);
          
          // Take up to 2 random fillers
          fillers = fillers.sort(() => Math.random() - 0.5).slice(0, 2);
          options = [...fillers, currentItem.phonemeDisplay];
      }

      // Shuffle the buttons so the answer isn't always last
      setCurrentOptions(options.sort(() => Math.random() - 0.5));
      
      // Reset turn state
      setHasGuessed(false);
      setLastGuessCorrect(null);

  }, [currentItem, content]);

  useEffect(() => {
    if (correctAnswersCount >= TARGET_CORRECT_ANSWERS) {
        const timer = setTimeout(() => {
            onComplete(sessionScore);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [correctAnswersCount, onComplete, sessionScore]);

  const playWordAudio = async () => {
    if (!currentItem || !currentItem.audioBlob) return;
    
    setIsPlaying(true);
    const url = URL.createObjectURL(currentItem.audioBlob);
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(e => {
        console.error("Play failed", e);
        setIsPlaying(false);
    });
  };

  const handleGuess = (guessedPhoneme: string) => {
    if (hasGuessed || !currentItem) return;

    const isCorrect = currentItem.phonemeDisplay === guessedPhoneme;

    setHasGuessed(true);
    setLastGuessCorrect(isCorrect);
    
    if (isCorrect) {
      setSessionScore(s => s + 1);
      setCorrectAnswersCount(c => c + 1);
    }

    playWordAudio();
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Reshuffle if we ran out but haven't hit target score
      const shuffled = [...content].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setCurrentIndex(0);
    }
  };

  if (!currentItem) {
      return <div className="p-8 text-center text-slate-500">No words available. Please add words in Creator Mode.</div>;
  }

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
      englishTranslation: "Listen to the recording"
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-8">
      <div className="w-full flex items-center justify-between px-2">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-600"><Home size={20}/></button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-slate-800">
            {correctAnswersCount} / {TARGET_CORRECT_ANSWERS}
          </span>
        </div>
      </div>

      <div className="w-full">
         <WordDisplay 
           challenge={challengeDisplay} 
           onPlayAudio={playWordAudio}
           isPlaying={isPlaying}
         />
      </div>

      <div className="h-12 flex items-center justify-center w-full">
        {hasGuessed && (
          <div className={`flex items-center gap-2 text-lg font-bold ${lastGuessCorrect ? 'text-green-600' : 'text-red-500'}`}>
            {lastGuessCorrect ? (
              <>
                <CheckCircle2 size={28} />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <XCircle size={28} />
                <span>Incorrect, it was "{currentItem.phonemeDisplay}"</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {currentOptions.map((p, idx) => {
           let btnColorClass = "bg-white hover:bg-slate-50 border-slate-200 text-slate-800";
           
           if (hasGuessed) {
              if (p === currentItem.phonemeDisplay) {
                  btnColorClass = "bg-green-100 border-green-300 text-green-800 ring-2 ring-green-200";
              } else if (p === (lastGuessCorrect === false ? '' : '') || (p !== currentItem.phonemeDisplay)) {
                  btnColorClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-50";
              }
           }

           return (
            <button
              key={`${p}-${idx}`}
              onClick={() => handleGuess(p)}
              disabled={hasGuessed}
              className={`
                h-24 rounded-2xl border-b-4 text-3xl font-bold flex items-center justify-center shadow-sm transition-all
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
        <button
          onClick={handleNext}
          className="mt-4 flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 transition-colors hover:scale-105 active:scale-95"
        >
          Next Word
          <RotateCw size={18} />
        </button>
      )}
    </div>
  );
};

export default PhonemeGame;
