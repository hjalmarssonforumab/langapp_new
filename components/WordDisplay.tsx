import React from 'react';
import { WordChallenge } from '../types';
import { Volume2 } from 'lucide-react';

interface WordDisplayProps {
  challenge: WordChallenge;
  onPlayAudio: () => void;
  isPlaying: boolean;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ challenge, onPlayAudio, isPlaying }) => {
  return (
    <button
      onClick={onPlayAudio}
      disabled={isPlaying}
      className={`
        group relative w-full max-w-md p-8 md:p-12 rounded-2xl shadow-xl 
        transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl
        bg-white border-2 border-slate-100 active:scale-95
        flex flex-col items-center justify-center gap-4
        ${isPlaying ? 'ring-4 ring-blue-200' : ''}
      `}
    >
      <div className="absolute top-4 right-4 text-slate-400 group-hover:text-blue-500 transition-colors">
        <Volume2 size={24} className={isPlaying ? 'animate-pulse text-blue-500' : ''} />
      </div>

      <div className="text-4xl md:text-6xl font-medium tracking-wide text-slate-800">
        <span>{challenge.prefix}</span>
        <span className="text-red-600 font-extrabold underline decoration-red-300 underline-offset-4">
          {challenge.highlight}
        </span>
        <span>{challenge.suffix}</span>
      </div>

      <div className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">
        Tap to Listen
      </div>
    </button>
  );
};

export default WordDisplay;
