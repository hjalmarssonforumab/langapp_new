
import React, { useState, useMemo } from 'react';
import { GameContent } from '../../types';
import { Plus, AlertTriangle, PlayCircle, FileJson, Search } from 'lucide-react';

interface WordListSidebarProps {
  content: GameContent[];
  selectedId: string | null;
  onSelect: (item: GameContent) => void;
  onNew: () => void;
  onPlayAudio: (blob: Blob) => void;
}

const WordListSidebar: React.FC<WordListSidebarProps> = ({ content, selectedId, onSelect, onNew, onPlayAudio }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContent = useMemo(() => {
    if (!searchTerm) return content;
    return content.filter(item => 
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phonemeDisplay.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [content, searchTerm]);

  return (
    <div className="w-1/3 min-w-[300px] max-w-md bg-white border-r border-slate-200 flex flex-col z-0">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
        <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700 text-sm">Library</span>
            <button type="button" onClick={onNew} className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold transition-colors">
            <Plus size={16}/> New
            </button>
        </div>
        
        <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input 
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredContent.map(item => (
          <div 
            key={item.id} 
            onClick={() => onSelect(item)}
            className={`
              p-2 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group select-none
              ${selectedId === item.id 
                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-300 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm'
              }
            `}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
              {item.isImageFile ? (
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{item.image}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 truncate flex items-center gap-2 text-sm">
                {item.word}
                {!item.audioBlob && (
                  <span title="Missing Audio">
                    <AlertTriangle size={12} className="text-orange-500" />
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-mono bg-slate-200 inline-block px-1.5 rounded mt-0.5">
                {item.phonemeDisplay}
              </div>
            </div>

            {item.audioBlob && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayAudio(item.audioBlob!);
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Quick Play"
              >
                <PlayCircle size={20} />
              </button>
            )}
          </div>
        ))}
        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
            <FileJson size={48} className="mb-4 opacity-20"/>
            <p className="text-sm">No words found.</p>
            <p className="text-xs mt-2">{searchTerm ? 'Try a different search.' : 'Click "New" to start.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordListSidebar;
