
import React, { useState } from 'react';
import { GameContent } from '../types';
import { Loader2, CheckCircle2 } from 'lucide-react';
import AdminHeader from './admin/AdminHeader';
import WordListSidebar from './admin/WordListSidebar';
import WordEditor from './admin/WordEditor';
import ConfirmModal from './ui/ConfirmModal';

interface AdminDashboardProps {
  content: GameContent[];
  currentLanguage: string; // Passed from App
  onAdd: (item: GameContent) => void;
  onUpdate: (item: GameContent) => void;
  onDelete: (id: string) => void;
  onImport: (file: File) => Promise<{ success: boolean; count: number }>;
  onExport: () => Promise<void>;
  onBack: () => void;
  isImporting: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  content, currentLanguage, onAdd, onUpdate, onDelete, onImport, onExport, onBack, isImporting 
}) => {
  // UI State
  const [selectedItem, setSelectedItem] = useState<GameContent | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Confirmation Modal State (Only for Delete now)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // --- Helpers ---
  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  // --- Handlers: Save/Update (Immediate) ---
  const handleSaveItem = (item: GameContent) => {
    const isExisting = content.some(c => String(c.id) === String(item.id));

    if (isExisting) {
        onUpdate(item);
        showToast("Word updated successfully");
    } else {
        onAdd(item);
        showToast("New word created");
    }
    setSelectedItem(null);
  };

  // --- Handlers: Import/Export Proxies ---
  const handleImportProxy = async (file: File) => {
      try {
          const result = await onImport(file);
          if (result.success) {
              showToast(`Imported ${result.count} items`);
              setSelectedItem(null);
          }
      } catch (error: any) {
          alert(error.message || "Import failed");
      }
  };

  const handleExportProxy = async () => {
      try {
          await onExport();
          showToast("Database exported");
      } catch (error: any) {
          alert(error.message || "Export failed");
      }
  };

  // --- Handlers: Delete Flow ---
  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const performDelete = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      setSelectedItem(null);
      showToast("Word permanently deleted");
    }
    setDeleteTargetId(null);
  };

  const handlePlayAudio = (blob: Blob) => {
     const url = URL.createObjectURL(blob);
     const audio = new Audio(url);
     audio.play().catch(e => console.error("Audio play error", e));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 relative overflow-hidden">
      
      {/* Confirmation Modal for Delete */}
      <ConfirmModal 
        isOpen={!!deleteTargetId}
        title="Delete Word?"
        message="This action cannot be undone. The word, image, and audio will be permanently removed."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={performDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

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

      {/* Header Module - Handles IO */}
      <AdminHeader 
        wordCount={content.length}
        hasContent={content.length > 0} 
        onBack={onBack}
        onImport={handleImportProxy}
        onExport={handleExportProxy}
        isBusy={isImporting}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Module - Handles List */}
        <WordListSidebar 
            content={content}
            selectedId={selectedItem?.id || null}
            onSelect={setSelectedItem}
            onNew={() => setSelectedItem(null)}
            onPlayAudio={handlePlayAudio}
        />

        {/* Editor Module - Handles Form */}
        <WordEditor 
            key={selectedItem ? selectedItem.id : 'new-item'}
            initialData={selectedItem}
            currentLanguage={currentLanguage}
            onSave={handleSaveItem}
            onDelete={handleDeleteRequest}
            onCancel={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
