
import { useState, useCallback } from 'react';
import { GameContent } from '../types';
import { importDatabase, exportDatabase } from '../services/storageUtils';

export const useGameContent = () => {
  const [content, setContent] = useState<GameContent[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const addWord = useCallback((newItem: GameContent) => {
    setContent(prev => [...prev, newItem]);
  }, []);

  const updateWord = useCallback((updatedItem: GameContent) => {
    setContent(prev => prev.map(item => String(item.id) === String(updatedItem.id) ? updatedItem : item));
  }, []);

  const deleteWord = useCallback((id: string) => {
    console.log("Attempting to delete word with ID:", id);
    setContent(prev => {
        const filtered = prev.filter(item => String(item.id) !== String(id));
        console.log(`Deleted. Prev count: ${prev.length}, New count: ${filtered.length}`);
        return filtered;
    });
  }, []);

  const importData = useCallback(async (file: File) => {
    if (content.length > 0 && !window.confirm("Importing will OVERWRITE your current list. Continue?")) {
      return;
    }

    setIsImporting(true);
    try {
      const newContent = await importDatabase(file);
      setContent(newContent);
      alert(`Success! Imported ${newContent.length} words.`);
    } catch (e: any) {
      console.error("Import failed", e);
      alert(`Import failed: ${e.message || "Unknown error"}`);
    } finally {
      setIsImporting(false);
    }
  }, [content.length]);

  const exportData = useCallback(async () => {
    if (content.length === 0) {
      alert("No data to export.");
      return;
    }
    try {
      await exportDatabase(content);
    } catch (e) {
      console.error(e);
      alert("Export failed.");
    }
  }, [content]);

  return {
    content,
    isImporting,
    addWord,
    updateWord,
    deleteWord,
    importData,
    exportData
  };
};
