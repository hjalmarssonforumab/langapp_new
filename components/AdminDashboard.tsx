
import React, { useState } from 'react';
import { GameContent } from '../types';
import { Loader2, CheckCircle2 } from 'lucide-react';
import AdminHeader from './admin/AdminHeader';
import WordListSidebar from './admin/WordListSidebar';
import WordEditor from './admin/WordEditor';

interface AdminDashboardProps {
  content: GameContent[];
  onAdd: (item: GameContent) => void;
  onUpdate: (item: GameContent) => void;
  onDelete: (id: string) => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onBack: () => void;
  isImporting: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  content, onAdd, onUpdate, onDelete, onImport, onExport, onBack, isImporting 
}) => {
  const [selectedItem, setSelectedItem] = useState<GameContent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Handlers
  const handleCreateNew = () => setSelectedItem(null);
  const handleSelect = (item: GameContent) => setSelectedItem(item);
  
  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (item: GameContent) => {
    if (selectedItem) {
        onUpdate(item);
        showToast("Word updated!");
    } else {
        onAdd(item);
        showToast("New word added!");
    }
    setSelectedItem(null); // Reset to "New" state or clear
  };

  const handleDelete = (id: string) => {
      onDelete(id);
      setSelectedItem(null);
      showToast("Word deleted.");
  };

  const handlePlayAudio = (blob: Blob) => {
     const url = URL.createObjectURL(blob);
     const audio = new Audio(url);
     audio.play();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 relative">
      {isImporting && (
        <div className="absolute inset-0 bg-slate-900/50 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
            <Loader2 size={64} className="animate-spin mb-4 text-blue-400"/>
            <h2 className="text-2xl font-bold">Importing Database...</h2>
            <p className="text-slate-300">Please wait while we process your file.</p>
        </div>
      )}

      {toastMsg && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={18} className="text-green-400"/>
                  {toastMsg}
              </div>
          </div>
      )}

      <AdminHeader 
        wordCount={content.length} 
        onBack={onBack}
        onImport={onImport}
        onExport={onExport}
        isBusy={isImporting}
      />

      <div className="flex flex-1 overflow-hidden">
        <WordListSidebar 
            content={content}
            selectedId={selectedItem?.id || null}
            onSelect={handleSelect}
            onNew={handleCreateNew}
            onPlayAudio={handlePlayAudio}
        />

        <WordEditor 
            key={selectedItem ? selectedItem.id : 'new'} // Reset form when selection changes
            initialData={selectedItem}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
