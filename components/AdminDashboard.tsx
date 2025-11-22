
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
  onImport: (file: File) => Promise<{ success: boolean; count: number }>;
  onExport: () => Promise<void>;
  onBack: () => void;
  isImporting: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  content, onAdd, onUpdate, onDelete, onImport, onExport, onBack, isImporting 
}) => {
  // UI State
  const [selectedItem, setSelectedItem] = useState<GameContent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- UI Handlers ---

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveItem = (item: GameContent) => {
    // Logic to distinguish Add vs Update is handled here in the controller
    const isExisting = content.some(c => String(c.id) === String(item.id));

    if (isExisting) {
        onUpdate(item);
        showToast("Word updated successfully");
    } else {
        onAdd(item);
        showToast("New word created");
    }
    setSelectedItem(null); // Return to "New" state or clear selection
  };

  const handleDeleteItem = (id: string) => {
      onDelete(id);
      setSelectedItem(null);
      showToast("Word permanently deleted");
  };

  const handleImportWrapper = async (file: File) => {
      try {
          const result = await onImport(file);
          if (result.success) {
              showToast(`Imported ${result.count} items`);
          }
      } catch (error: any) {
          alert(error.message || "Import failed");
      }
  };

  const handleExportWrapper = async () => {
      try {
          await onExport();
          showToast("Database exported");
      } catch (error: any) {
          alert(error.message || "Export failed");
      }
  };

  const handlePlayAudio = (blob: Blob) => {
     const url = URL.createObjectURL(blob);
     const audio = new Audio(url);
     audio.play().catch(e => console.error("Audio play error", e));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 relative overflow-hidden">
      
      {/* Loading Overlay */}
      {isImporting && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in">
            <Loader2 size={64} className="animate-spin mb-4 text-blue-400"/>
            <h2 className="text-2xl font-bold">Importing Database...</h2>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm border border-slate-700">
                  <CheckCircle2 size={18} className="text-green-400"/>
                  {toastMsg}
              </div>
          </div>
      )}

      {/* Header Module */}
      <AdminHeader 
        wordCount={content.length} 
        onBack={onBack}
        onImport={handleImportWrapper}
        onExport={handleExportWrapper}
        isBusy={isImporting}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Module */}
        <WordListSidebar 
            content={content}
            selectedId={selectedItem?.id || null}
            onSelect={setSelectedItem}
            onNew={() => setSelectedItem(null)}
            onPlayAudio={handlePlayAudio}
        />

        {/* Editor Module */}
        <WordEditor 
            key={selectedItem ? selectedItem.id : 'new-item'} // Force reset when switching items
            initialData={selectedItem}
            onSave={handleSaveItem}
            onDelete={handleDeleteItem}
            onCancel={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
