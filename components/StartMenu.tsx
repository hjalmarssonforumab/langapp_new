
import React from 'react';
import { ListMusic, Settings, Ear, Shapes, Play, Keyboard } from 'lucide-react';

interface StartMenuProps {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  onPhaseChange: (phase: any) => void;
  onQuickStart: (type: 'PHONEME' | 'MATCHING' | 'SPELLING') => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
];

const StartMenu: React.FC<StartMenuProps> = ({ currentLanguage, onLanguageChange, onPhaseChange, onQuickStart }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-5xl">
      <div className="space-y-4">
        <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">Polyglot Trainer</h1>
        <p className="text-xl text-slate-500 max-w-md mx-auto">Master pronunciation in any language.</p>
      </div>

      {/* Language Selector */}
      <div className="flex flex-wrap justify-center gap-3">
          {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm
                  ${currentLanguage === lang.code 
                    ? 'bg-slate-900 text-white scale-105' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }
                `}
              >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.name}
              </button>
          ))}
      </div>
      
      <div className="w-full max-w-2xl flex justify-center gap-4">
            <button 
              onClick={() => onPhaseChange('LESSON_CREATOR')}
              className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold uppercase tracking-widest px-6 py-3 rounded-full shadow-md hover:shadow-lg"
          >
              <ListMusic size={18} /> Lesson Creator
          </button>
          <button 
              onClick={() => onPhaseChange('ADMIN')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold uppercase tracking-widest bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200"
          >
              <Settings size={18} /> Database
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <QuickStartCard 
          title="Quick Phoneme" 
          desc="Practice sounds." 
          color="blue" 
          icon={<Ear size={24} />} 
          onClick={() => onQuickStart('PHONEME')} 
        />
        <QuickStartCard 
          title="Quick Matching" 
          desc="Match words." 
          color="purple" 
          icon={<Shapes size={24} />} 
          onClick={() => onQuickStart('MATCHING')} 
        />
        <QuickStartCard 
          title="Quick Spelling" 
          desc="Type what you hear." 
          color="orange" 
          icon={<Keyboard size={24} />} 
          onClick={() => onQuickStart('SPELLING')} 
        />
      </div>
    </div>
  );
};

const QuickStartCard: React.FC<{ title: string; desc: string; color: string; icon: React.ReactNode; onClick: () => void }> = ({ title, desc, color, icon, onClick }) => {
  const colorClasses: any = {
    blue: 'hover:border-blue-500 text-blue-600 bg-blue-100',
    purple: 'hover:border-purple-500 text-purple-600 bg-purple-100',
    orange: 'hover:border-orange-500 text-orange-600 bg-orange-100'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`group relative bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent transition-all hover:-translate-y-1 ${colorClasses[color].split(' ')[0]}`}
    >
      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${colorClasses[color].split(' ').slice(1).join(' ')}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mt-4 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{desc}</p>
      <div className={`mt-6 flex items-center justify-center font-semibold text-sm uppercase tracking-wider ${colorClasses[color].split(' ')[1]}`}>
        Start <Play size={16} className="ml-2 fill-current" />
      </div>
    </button>
  );
};

export default StartMenu;
