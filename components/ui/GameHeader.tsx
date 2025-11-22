
import React from 'react';
import { Home, Trophy } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  subtitle?: string;
  progress: number;
  score?: number;
  total?: number;
  onExit: () => void;
  children?: React.ReactNode;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, subtitle, progress, score, total, onExit, children }) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between px-2">
        <button 
          onClick={onExit} 
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Exit Exercise"
        >
          <Home size={20}/>
        </button>

        <div className="text-center">
            <h2 className="text-lg font-bold text-slate-700 flex items-center justify-center gap-2">
                {children}
                {title}
            </h2>
            {subtitle && (
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {subtitle}
                </p>
            )}
        </div>

        {score !== undefined && total !== undefined ? (
           <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-800">
             <Trophy className="w-4 h-4 text-yellow-500" />
             <span>{score} / {total}</span>
           </div>
        ) : (
            <div className="w-10"></div> // Spacer
        )}
      </div>
    </div>
  );
};

export default GameHeader;
