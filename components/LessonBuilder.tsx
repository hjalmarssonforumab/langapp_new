
import React, { useState } from 'react';
import { GameContent, ExerciseConfig, ExerciseType, MatchingDifficulty } from '../types';
import { Plus, Trash2, Play, Shuffle, ArrowUp, ArrowDown, CheckSquare, Square, X, Search, Settings2 } from 'lucide-react';

interface LessonBuilderProps {
  content: GameContent[];
  onStartLesson: (plan: ExerciseConfig[]) => void;
  onBack: () => void;
}

const LessonBuilder: React.FC<LessonBuilderProps> = ({ content, onStartLesson, onBack }) => {
  const [plan, setPlan] = useState<ExerciseConfig[]>([]);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  
  // Filter only valid content (has audio)
  const validContent = content.filter(c => c.audioBlob !== null);

  const addExercise = (type: ExerciseType) => {
    const newExercise: ExerciseConfig = {
      id: Date.now().toString(),
      type,
      wordIds: [],
      difficulty: type === 'MATCHING' ? 'LEVEL_1' : undefined
    };
    setPlan(prev => [...prev, newExercise]);
    setEditingExerciseId(newExercise.id);
  };

  const removeExercise = (id: string) => {
    setPlan(prev => prev.filter(e => e.id !== id));
    if (editingExerciseId === id) setEditingExerciseId(null);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === plan.length - 1) return;
    
    const newPlan = [...plan];
    const temp = newPlan[index];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    newPlan[index] = newPlan[targetIndex];
    newPlan[targetIndex] = temp;
    setPlan(newPlan);
  };

  const updateExercise = (exerciseId: string, updates: Partial<ExerciseConfig>) => {
    setPlan(prev => prev.map(e => 
      e.id === exerciseId ? { ...e, ...updates } : e
    ));
  };

  const randomizeWords = (exerciseId: string, count: number) => {
    if (validContent.length === 0) return;
    const shuffled = [...validContent].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count).map(c => c.id);
    updateExercise(exerciseId, { wordIds: selected });
  };

  const handleStart = () => {
    if (plan.length === 0) {
      alert("Please add at least one exercise.");
      return;
    }
    const emptyExercises = plan.filter(e => e.wordIds.length === 0);
    if (emptyExercises.length > 0) {
      alert("Some exercises have no words selected. Please add words or remove the empty exercises.");
      return;
    }
    onStartLesson(plan);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex gap-6 h-[calc(100vh-100px)]">
      
      {/* LEFT: Playlist Builder */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lesson Builder</h2>
            <p className="text-slate-500 text-sm">Create a sequence of exercises.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">
              Cancel
            </button>
            <button 
              onClick={handleStart}
              disabled={plan.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              <Play size={20} fill="currentColor" />
              Start Lesson
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100/50">
          {plan.length === 0 && (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-300 rounded-xl">
              <p>No exercises yet.</p>
              <p className="text-sm">Click buttons below to add rounds.</p>
            </div>
          )}

          {plan.map((ex, index) => (
            <div 
              key={ex.id} 
              className={`
                relative bg-white rounded-xl border-2 transition-all overflow-visible
                ${editingExerciseId === ex.id ? 'border-blue-500 ring-4 ring-blue-100 z-10 shadow-lg' : 'border-slate-200 shadow-sm hover:border-blue-300'}
              `}
            >
              <div className="flex items-center justify-between p-4 bg-white rounded-t-xl">
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => setEditingExerciseId(ex.id)}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0
                    ${ex.type === 'PHONEME' ? 'bg-blue-500' : 'bg-purple-500'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {ex.type === 'PHONEME' ? 'Phoneme Training' : 'Matching Game'}
                      {ex.type === 'MATCHING' && (
                          <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                            {ex.difficulty === 'LEVEL_1' ? 'Lvl 1' : ex.difficulty === 'LEVEL_2' ? 'Lvl 2' : 'Lvl 3'}
                          </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {ex.wordIds.length} words selected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {/* Difficulty Selector for Matching */}
                   {ex.type === 'MATCHING' && (
                       <select 
                        className="text-xs border border-slate-200 rounded-lg p-1 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 mr-2 cursor-pointer"
                        value={ex.difficulty || 'LEVEL_1'} 
                        onChange={(e) => updateExercise(ex.id, { difficulty: e.target.value as MatchingDifficulty })}
                        onClick={(e) => e.stopPropagation()}
                       >
                           <option value="LEVEL_1">Level 1 (Normal)</option>
                           <option value="LEVEL_2">Level 2 (Hard)</option>
                           <option value="LEVEL_3">Level 3 (Expert)</option>
                       </select>
                   )}

                   {/* Randomize Button Shortcut */}
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = ex.type === 'MATCHING' ? 6 : 5;
                      randomizeWords(ex.id, count);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    title={`Pick random words (Default: ${ex.type === 'MATCHING' ? 6 : 5})`}
                   >
                     <Shuffle size={14} /> 
                     <span className="hidden sm:inline">Rand {ex.type === 'MATCHING' ? 6 : 5}</span>
                   </button>

                   <div className="h-6 w-px bg-slate-200 mx-2"></div>

                   <div className="flex flex-col">
                     <button 
                       onClick={() => moveExercise(index, 'up')} 
                       disabled={index === 0}
                       className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                     >
                       <ArrowUp size={14} />
                     </button>
                     <button 
                       onClick={() => moveExercise(index, 'down')} 
                       disabled={index === plan.length - 1}
                       className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                     >
                       <ArrowDown size={14} />
                     </button>
                   </div>

                   <button 
                     onClick={() => removeExercise(ex.id)}
                     className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg ml-2"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
              
              {/* Expanded Selection Area */}
              {editingExerciseId === ex.id && (
                 <div className="bg-slate-50 border-t border-slate-100 p-2 text-xs text-center text-blue-600 font-bold rounded-b-xl">
                    Select words from the panel on the right &rarr;
                 </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-4">
          <button 
            onClick={() => addExercise('PHONEME')}
            className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Plus size={20} /> Add Phoneme Round
          </button>
          <button 
            onClick={() => addExercise('MATCHING')}
            className="flex items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Plus size={20} /> Add Matching Round
          </button>
        </div>
      </div>

      {/* RIGHT: Word Selector (Context aware) */}
      <div className="w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-700">Word Library</h3>
          <p className="text-xs text-slate-400">
            {editingExerciseId 
              ? "Check words to add to current exercise" 
              : "Select an exercise on the left to edit"}
          </p>
        </div>

        {editingExerciseId ? (
          <WordSelector 
             content={validContent}
             selectedIds={plan.find(e => e.id === editingExerciseId)?.wordIds || []}
             onSelectionChange={(newIds) => updateExercise(editingExerciseId, { wordIds: newIds })}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-300 p-8 text-center">
            Click an exercise card on the left to select words for it.
          </div>
        )}
      </div>
    </div>
  );
};

interface WordSelectorProps {
  content: GameContent[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

const WordSelector: React.FC<WordSelectorProps> = ({ content, selectedIds, onSelectionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleWord = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const filteredContent = content.filter(c => 
    c.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input 
            type="text" 
            placeholder="Search words..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredContent.length === 0 && (
            <div className="text-center p-4 text-slate-400 text-sm">No matching words found.</div>
        )}
        
        {filteredContent.map(item => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => toggleWord(item.id)}
              className={`
                flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'}
              `}
            >
              <div className={`shrink-0 transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
              </div>
              
              <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                 {item.isImageFile ? (
                   <img src={item.image} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-sm">{item.image}</span>
                 )}
              </div>
              
              <span className="font-medium text-sm truncate select-none">{item.word}</span>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between">
        <span>{selectedIds.length} selected</span>
        {selectedIds.length > 0 && (
            <button onClick={() => onSelectionChange([])} className="text-red-500 hover:underline">Clear</button>
        )}
      </div>
    </div>
  );
};

export default LessonBuilder;
