
import React, { useState, useEffect } from 'react';
import { GameContent } from '../../types';
import { parseBracketedWord } from '../../services/wordUtils';
import { Edit2, Plus, Save, Trash2, X, BookOpen, Image as ImageIcon } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import ImageSelector from './ImageSelector';

interface WordEditorProps {
  initialData: GameContent | null;
  onSave: (data: GameContent) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const COMMON_PHONEMES = ['sj', 'tj', 'sk', 'ng', 'j', 'lj', 'stj', 'skj', 'ch', 'g', 'k'];

const WordEditor: React.FC<WordEditorProps> = ({ initialData, onSave, onDelete, onCancel }) => {
  // Content State
  const [wordInput, setWordInput] = useState('');
  const [phonemeDisplay, setPhonemeDisplay] = useState('');
  const [distractors, setDistractors] = useState<string[]>([]);
  
  // Media State
  const [imageInput, setImageInput] = useState('');
  const [isImageFile, setIsImageFile] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // UI Helper
  const [customDistractor, setCustomDistractor] = useState('');

  useEffect(() => {
    if (initialData) {
      const prefix = initialData.word.substring(0, initialData.word.indexOf(initialData.highlight));
      const suffix = initialData.word.substring(initialData.word.indexOf(initialData.highlight) + initialData.highlight.length);
      const bracketed = initialData.highlight ? `${prefix}[${initialData.highlight}]${suffix}` : initialData.word;

      setWordInput(bracketed);
      setPhonemeDisplay(initialData.phonemeDisplay);
      setDistractors(initialData.distractors || []);
      setImageInput(initialData.image);
      setIsImageFile(initialData.isImageFile);
      setAudioBlob(initialData.audioBlob);
    } else {
      setWordInput('');
      setPhonemeDisplay('');
      setDistractors([]);
      setImageInput('');
      setIsImageFile(false);
      setAudioBlob(null);
    }
  }, [initialData]);

  const handleSave = () => {
    if (!wordInput || !phonemeDisplay || !imageInput || !audioBlob) {
      alert("Please fill in all fields (Word, Phoneme, Image, Audio).");
      return;
    }

    const parsed = parseBracketedWord(wordInput);
    
    const newItem: GameContent = {
      id: initialData?.id || Date.now().toString(),
      word: parsed.fullWord,
      highlight: parsed.highlight,
      phonemeDisplay: phonemeDisplay,
      distractors: distractors,
      image: imageInput,
      isImageFile: isImageFile,
      audioBlob: audioBlob,
      category: 'custom'
    };

    onSave(newItem);
  };

  const handleAddDistractor = (val: string) => {
      const cleanVal = val.trim();
      if (cleanVal && !distractors.includes(cleanVal) && cleanVal !== phonemeDisplay) {
          setDistractors([...distractors, cleanVal]);
      }
      setCustomDistractor('');
  };

  const removeDistractor = (val: string) => {
      setDistractors(distractors.filter(d => d !== val));
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    // Prevent form submission or parent bubbling
    e.preventDefault();
    e.stopPropagation();

    if (!initialData) return;

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${initialData.word}"? This cannot be undone.`);
    if (confirmed) {
        onDelete(initialData.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col h-full">
        {/* Sticky Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${initialData ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {initialData ? <Edit2 size={20}/> : <Plus size={20}/> }
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">
                        {initialData ? 'Edit Word' : 'Create Word'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                        {initialData ? `ID: ${initialData.id.slice(0,6)}...` : 'New Entry'}
                    </p>
                </div>
            </div>
            
            <div className="flex gap-2 items-center">
                 {initialData && (
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 font-bold text-sm mr-2"
                        title="Delete Word"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                    </button>
                )}

                <button 
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={handleSave}
                    className="px-6 py-2 text-white rounded-lg font-bold shadow-md bg-slate-900 hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2 text-sm"
                >
                    <Save size={18} />
                    Save
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
                {/* LEFT: Linguistic Data */}
                <div className="col-span-1 lg:col-span-7 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3 mb-4">
                            <BookOpen size={18} className="text-blue-500"/>
                            <h3>Linguistic Data</h3>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Word Text <span className="text-slate-300 ml-1">(Use [ ] for highlight)</span>
                                </label>
                                <input 
                                    type="text"
                                    value={wordInput}
                                    onChange={(e) => setWordInput(e.target.value)}
                                    placeholder="e.g. [Sj]ukhus"
                                    className="w-full px-4 py-3 text-lg rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                                {wordInput && (
                                    <div className="mt-2 text-sm text-slate-500 flex items-center gap-2 pl-1">
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Preview:</span> 
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800" dangerouslySetInnerHTML={{
                                        __html: (() => {
                                        const p = parseBracketedWord(wordInput);
                                        return `${p.prefix}<span class="text-red-600 font-bold">${p.highlight || '...'}</span>${p.suffix}`;
                                        })()
                                    }} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Correct Phoneme
                                    </label>
                                    <input 
                                        type="text"
                                        value={phonemeDisplay}
                                        onChange={(e) => setPhonemeDisplay(e.target.value)}
                                        placeholder="e.g. sj"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none font-bold text-green-700"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Distractors (Wrong Options)
                                </label>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {distractors.map(d => (
                                        <span key={d} className="flex items-center gap-1 px-3 py-1 bg-white text-slate-700 rounded-full text-xs font-bold border border-slate-200 shadow-sm">
                                            {d}
                                            <button onClick={() => removeDistractor(d)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                                        </span>
                                    ))}
                                    {distractors.length === 0 && <span className="text-xs text-slate-400 italic p-1">None selected</span>}
                                </div>

                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text"
                                        value={customDistractor}
                                        onChange={(e) => setCustomDistractor(e.target.value)}
                                        placeholder="Add custom..."
                                        className="flex-1 min-w-[100px] px-3 py-1.5 text-sm rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddDistractor(customDistractor); } }}
                                    />
                                    <button onClick={() => handleAddDistractor(customDistractor)} disabled={!customDistractor} className="px-3 bg-white border border-slate-300 rounded-lg hover:bg-slate-100">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quick Add</span>
                                    <div className="flex flex-wrap gap-1">
                                        {COMMON_PHONEMES.map(p => (
                                            <button 
                                                key={p} type="button"
                                                disabled={distractors.includes(p) || phonemeDisplay === p}
                                                onClick={() => handleAddDistractor(p)}
                                                className="px-2 py-1 text-[10px] bg-white border border-slate-200 rounded hover:border-blue-400 hover:text-blue-600 disabled:opacity-30"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Media Assets */}
                <div className="col-span-1 lg:col-span-5 space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3 mb-4">
                            <ImageIcon size={18} className="text-purple-500"/>
                            <h3>Media Assets</h3>
                        </div>

                        <div className="space-y-6">
                            <AudioRecorder 
                                audioBlob={audioBlob}
                                onAudioChange={setAudioBlob}
                            />

                            <div className="pt-2 border-t border-slate-100">
                                <ImageSelector 
                                    image={imageInput}
                                    isImageFile={isImageFile}
                                    wordContext={parseBracketedWord(wordInput).fullWord}
                                    onChange={(img, isFile) => {
                                        setImageInput(img);
                                        setIsImageFile(isFile);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default WordEditor;
