import React, { useRef } from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageSelectorProps {
  image: string;
  isImageFile: boolean;
  wordContext: string;
  onChange: (image: string, isFile: boolean) => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ image, isImageFile, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        </div>

        {/* Image Actions */}
        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center p-3 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors text-sm font-bold gap-1"
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