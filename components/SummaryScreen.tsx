
import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface SummaryScreenProps {
  totalScore: number;
  onRestart: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ totalScore, onRestart }) => {
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
      <Trophy className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-md" />
      <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Congratulations!</h1>
      <p className="text-slate-500 mb-8">You have completed the lesson.</p>
      
      <div className="bg-slate-50 rounded-2xl p-6 w-full mb-8 border border-slate-100">
        <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Score</div>
        <div className="text-6xl font-black text-blue-600">{totalScore}</div>
        <div className="text-slate-400 text-sm mt-2">Great Job!</div>
      </div>

      <button 
        onClick={onRestart}
        className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
      >
        <RefreshCw size={20} />
        Back to Menu
      </button>
    </div>
  );
};

export default SummaryScreen;
