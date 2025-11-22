
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Database, RefreshCw } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

interface AdminHeaderProps {
  wordCount: number;
  hasContent: boolean;
  onBack: () => void;
  onImport: (file: File) => Promise<void>;
  onExport: () => Promise<void>;
  onLoadDefaults: () => Promise<void>;
  isBusy: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  wordCount, hasContent, onBack, onImport, onExport, onLoadDefaults, isBusy 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; type: 'IMPORT' | 'DEFAULTS' | null }>({ isOpen: false, type: null });

  const handleImportClick = () => {
    if (hasContent) {
      setConfirmState({ isOpen: true, type: 'IMPORT' });
    } else {
      triggerFileInput();
    }
  };

  const handleDefaultsClick = () => {
      if (hasContent) {
          setConfirmState({ isOpen: true, type: 'DEFAULTS' });
      } else {
          onLoadDefaults();
      }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset to allow selecting same file again
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImport(file);
    }
  };

  return (
    <>
      {/* Local Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title="Overwrite Database?"
        message="This will PERMANENTLY REPLACE your current list with the new data. Are you sure?"
        confirmLabel="Overwrite"
        isDestructive={true}
        onConfirm={() => {
          const type = confirmState.type;
          setConfirmState({ isOpen: false, type: null });
          if (type === 'IMPORT') triggerFileInput();
          if (type === 'DEFAULTS') onLoadDefaults();
        }}
        onCancel={() => setConfirmState({ isOpen: false, type: null })}
      />

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange} 
      />

      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Database className="text-blue-400 hidden sm:block" size={24} />
              Creator Studio
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">Database contains <span className="text-white font-bold">{wordCount}</span> words</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Load Defaults Action */}
          <button 
            type="button"
            onClick={handleDefaultsClick} 
            disabled={isBusy}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700 disabled:opacity-50 hover:border-slate-500"
            title="Load Default Database"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Defaults</span>
          </button>

          {/* Import Action */}
          <button 
            type="button"
            onClick={handleImportClick} 
            disabled={isBusy}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-700 disabled:opacity-50 hover:border-slate-500"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
            <span className="sm:hidden">Imp</span>
          </button>
          
          {/* Export Action */}
          <button 
            type="button"
            onClick={onExport}
            disabled={isBusy || wordCount === 0}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-800"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Exp</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
