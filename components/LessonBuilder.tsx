
import React, { useState, useRef, useEffect } from 'react';
import { GameContent, ExerciseConfig, ExerciseType, MatchingDifficulty, SpellingDifficulty } from '../types';
import { Plus, Trash2, Play, Shuffle, ArrowUp, ArrowDown, CheckSquare, Square, Search, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import ConfirmModal from './ui/ConfirmModal';

interface LessonBuilderProps {
  content: GameContent[];
  existingPlan: ExerciseConfig[];
  onSavePlan: (plan: ExerciseConfig[]) => void;
  onStartLesson: (plan: ExerciseConfig[]) => void;
  onImport: (file: File) => Promise<{ success: boolean; count: number }>;
  onExport: () => Promise<void>;
  onBack: () => void;
}

const LessonBuilder: React.FC<LessonBuilderProps> = ({ 
  content, existingPlan, onSavePlan, onStartLesson, onImport, onExport, onBack 
}) => {
  const [plan, setPlan] = useState<ExerciseConfig[]>(existingPlan);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: 'IMPORT' | null }>({ isOpen: false, type: null });

  // Sync internal plan with parent whenever it changes
  useEffect(() => {
      onSavePlan(plan);
  }, [plan, onSavePlan]);
  
  // Filter only valid content (has audio)
  const validContent = content.filter(c => c.audioBlob !== null);

  // --- Import / Export Handlers ---
  const handleImportClick = () => {
      setConfirmState({ isOpen: true, type: 'IMPORT' });
  };

  const performImport = () => {
    setConfirmState({ isOpen: false, type: null });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
          await onImport(file);
          // Plan is updated via parent props update
          showToast("Database & Lesson Plan Imported");
      } catch (error: any) {
          alert(error.message || "Import failed");
      }
    }
  };

  const handleExport = async () => {
      try {
          await onExport();
          showToast("Exported successfully");
      } catch(e) {
          console.error(e);
      }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- CRUD Handlers ---

  const addExercise = (type: ExerciseType) => {
    const newExercise: ExerciseConfig = {
      id: Date.now().toString(),
      type,
      wordIds: [],
      difficulty: 'LEVEL_1'
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

  const getExerciseTitle = (type: ExerciseType) => {
      switch(type) {
          case 'PHONEME': return 'Phoneme Training';
          case 'MATCHING': return 'Matching Game';
          case 'SPELLING': return 'Spelling Practice';
      }
  };

  const getExerciseColor = (type: ExerciseType) => {
      switch(type) {
          case 'PHONEME': return 'bg-blue-500';
          case 'MATCHING': return 'bg-purple-500';
          case 'SPELLING': return 'bg-orange-500';
      }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex gap-6 h-[calc(100vh-100px)] relative">
      
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
      
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm border border-slate-700 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} className="text-green-400"/>
            {toastMsg}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title="Overwrite Everything?"
        message="Importing will overwrite your current database AND lesson plan. Unsaved changes will be lost."
        confirmLabel="Import & Overwrite"
        isDestructive={true}
        onConfirm={performImport}
        onCancel={() => setConfirmState({ isOpen: false, type: null })}
      />

      {/* LEFT: Playlist Builder */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Lesson Builder</h2>
            <p className="text-slate-500 text-sm">Create and save your sequence.</p>
          </div>
          <div className="flex gap-2">
            
            {/* IO Buttons */}
            <button onClick={handleImportClick} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors" title="Import Lesson & DB">
                <Upload size={20} />
            </button>
            <button onClick={handleExport} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors mr-2" title="Save/Export Lesson & DB">
                <Download size={20} />
            </button>

            <button onClick={onBack} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">
              Exit
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
                    ${getExerciseColor(ex.type)}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      {getExerciseTitle(ex.type)}
                      {(ex.type === 'MATCHING' || ex.type === 'SPELLING') && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${ex.type === 'MATCHING' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                            {ex.difficulty === 'LEVEL_1' ? 'Lvl 1' : ex.difficulty === 'LEVEL_2' ? 'Lvl 2' : 'Lvl 3'}
                          </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {ex.wordIds.length} words selected
                    </p>
                    {/* HINT FOR LEVEL 3 */}
                    {ex.type === 'MATCHING' && ex.difficulty === 'LEVEL_3' && ex.wordIds.length > 0 && ex.wordIds.length <= 6 && (
                        <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold mt-1">
                            <AlertCircle size={10} />
                            Tip: Select 10+ words for dynamic swapping
                        </div>
                    )}
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

                    {/* Difficulty Selector for Spelling */}
                   {ex.type === 'SPELLING' && (
                       <select 
                        className="text-xs border border-slate-200 rounded-lg p-1 bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 mr-2 cursor-pointer"
                        value={ex.difficulty || 'LEVEL_1'} 
                        onChange={(e) => updateExercise(ex.id, { difficulty: e.target.value as SpellingDifficulty })}
                        onClick={(e) => e.stopPropagation()}
                       >
                           <option value="LEVEL_1">Level 1 (Pic + Audio)</option>
                           <option value="LEVEL_2">Level 2 (Audio Only)</option>
                       </select>
                   )}

                   {/* Randomize Button Shortcut */}
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const count = ex.type === 'MATCHING' ? 6 : ex.type === 'SPELLING' ? 3 : 5;
                      randomizeWords(ex.id, count);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    title={`Pick random words`}
                   >
                     <Shuffle size={14} /> 
                     <span className="hidden sm:inline">Rand {ex.type === 'MATCHING' ? 6 : ex.type === 'SPELLING' ? 3 : 5}</span>
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

        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-3 gap-3">
          <button 
            onClick={() => addExercise('PHONEME')}
            className="flex flex-col md:flex-row items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors border border-blue-200 text-xs md:text-sm"
          >
            <Plus size={18} /> Phoneme
          </button>
          <button 
            onClick={() => addExercise('MATCHING')}
            className="flex flex-col md:flex-row items-center justify-center gap-2 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors border border-purple-200 text-xs md:text-sm"
          >
            <Plus size={18} /> Matching
          </button>
          <button 
            onClick={() => addExercise('SPELLING')}
            className="flex flex-col md:flex-row items-center justify-center gap-2 py-3 bg-orange-50 text-orange-700 rounded-xl font-bold hover:bg-orange-100 transition-colors border border-orange-200 text-xs md:text-sm"
          >
            <Plus size={18} /> Spelling
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
