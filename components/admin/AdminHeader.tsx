
import React, { useRef } from 'react';
import { ArrowLeft, Upload, Download } from 'lucide-react';

interface AdminHeaderProps {
  wordCount: number;
  onBack: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
  isBusy: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ wordCount, onBack, onImport, onExport, isBusy }) => {
  const dbInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    dbInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (dbInputRef.current) dbInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Exercise Creator Studio</h1>
          <p className="text-slate-400 text-sm">Manage your vocabulary list ({wordCount} words)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          type="button"
          onClick={handleImportClick} 
          disabled={isBusy}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700 disabled:opacity-50"
        >
          <Upload size={16} />
          Import DB
        </button>
        <input 
          type="file" 
          ref={dbInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileChange} 
        />

        <button 
          type="button"
          onClick={onExport}
          disabled={isBusy}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
        >
          <Download size={16} />
          Export DB
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
