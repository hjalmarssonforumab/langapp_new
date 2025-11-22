
import React, { useRef } from 'react';
import { ArrowLeft, Upload, Download, Database } from 'lucide-react';

interface AdminHeaderProps {
  wordCount: number;
  onBack: () => void;
  onImport: (file: File) => Promise<void>;
  onExport: () => Promise<void>;
  isBusy: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ wordCount, onBack, onImport, onExport, isBusy }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (wordCount > 0) {
      const confirmed = window.confirm("Importing a database will OVERWRITE your current list. This action cannot be undone. Continue?");
      if (!confirmed) return;
    }

    // Trigger the hidden file input
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset to allow re-importing same file if needed
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button type="button" onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Database className="text-blue-400 hidden sm:block" size={24} />
            Exercise Creator Studio
          </h1>
          <p className="text-slate-400 text-xs md:text-sm">Database contains <span className="text-white font-bold">{wordCount}</span> words</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Import Action */}
        <button 
          type="button"
          onClick={handleImportClick} 
          disabled={isBusy}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700 disabled:opacity-50 hover:border-slate-500"
        >
          <Upload size={16} />
          <span className="hidden sm:inline">Import DB</span>
          <span className="sm:hidden">Import</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileChange} 
        />

        {/* Export Action */}
        <button 
          type="button"
          onClick={onExport}
          disabled={isBusy || wordCount === 0}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-800"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export DB</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
