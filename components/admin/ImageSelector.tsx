
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { generateIconForWord } from '../../services/gemini';

interface ImageSelectorProps {
  image: string;
  isImageFile: boolean;
  wordContext: string;
  // NOTE: In a future refactor, we could pass the actual language state here
  // But for now, we will rely on the text itself or just use the generic prompt update.
  onChange: (image: string, isFile: boolean) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ image, isImageFile, wordContext, onChange }) => {
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateImage = async () => {
    if (!wordContext) {
      alert("Please enter a word first.");
      return;
    }
    setGenerating(true);
    try {
      // For now we assume general or inferred language logic in prompt, 
      // or we can default to 'the word' if language isn't strictly passed here yet.
      // The service now accepts a language param, defaulting to Swedish if omitted.
      // Ideally we prop drill language here too, but simple word context often works for icons.
      const base64Image = await generateIconForWord(wordContext);
      onChange(base64Image, true);
    } catch (e) {
      console.error(e);
      alert("Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string, true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
        Visual Representation
      </label>
      
      <div className="flex flex-col gap-4">
        {/* Image Preview Box */}
        <div className="w-full aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative group">
          {image ? (
            isImageFile ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl">{image}</span>
            )
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <ImageIcon size={48} className="mb-2 opacity-50"/>
              <span>No image set</span>
            </div>
          )}
          {generating && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm z-10">
              <Sparkles className="animate-spin text-purple-500 mb-2" size={32} />
              <span className="text-purple-600 font-bold text-sm">Generating AI Art...</span>
            </div>
          )}
        </div>

        {/* Image Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={handleGenerateImage}
            disabled={generating}
            className="flex flex-col items-center justify-center p-3 bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-700 rounded-xl transition-colors text-sm font-bold gap-1"
          >
            <Sparkles size={20} />
            AI Generate
          </button>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-bold gap-1"
          >
            <Upload size={20} />
            Upload File
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        <div className="relative">
          <input 
            type="text" 
            value={!isImageFile ? image : ''}
            onChange={(e) => onChange(e.target.value, false)}
            placeholder="Or type an Emoji here..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 outline-none text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">😀</span>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
