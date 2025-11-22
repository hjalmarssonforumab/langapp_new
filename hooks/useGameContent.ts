
import { useState, useCallback } from 'react';
import { GameContent } from '../types';
import { importDatabase, exportDatabase } from '../services/storageUtils';
import { generateId } from '../services/idUtils';

export const useGameContent = () => {
  const [content, setContent] = useState<GameContent[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // --- CREATE ---
  const addWord = useCallback((itemData: Omit<GameContent, 'id'> | GameContent) => {
    const newItem: GameContent = {
        ...itemData,
        id: 'id' in itemData ? itemData.id : generateId()
    };
    
    console.log("[ContentManager] Adding:", newItem.word);
    setContent(prev => [...prev, newItem]);
  }, []);

  // --- UPDATE ---
  const updateWord = useCallback((updatedItem: GameContent) => {
    console.log("[ContentManager] Updating:", updatedItem.word);
    setContent(prev => prev.map(item => 
        String(item.id) === String(updatedItem.id) ? updatedItem : item
    ));
  }, []);

  // --- DELETE ---
  const deleteWord = useCallback((id: string) => {
    console.log("[ContentManager] Deleting ID:", id);
    setContent(prev => {
        const filtered = prev.filter(item => String(item.id) !== String(id));
        if (filtered.length === prev.length) {
            console.warn(`[ContentManager] Delete failed: ID ${id} not found.`);
        }
        return filtered;
    });
  }, []);

  // --- IMPORT (IO) ---
  const importData = useCallback(async (file: File) => {
    setIsImporting(true);
    try {
      const newContent = await importDatabase(file);
      setContent(newContent);
      return { success: true, count: newContent.length };
    } catch (e: any) {
      console.error("[ContentManager] Import failed", e);
      throw e; // Re-throw to let UI handle the specific error message
    } finally {
      setIsImporting(false);
    }
  }, []);

  // --- EXPORT (IO) ---
  const exportData = useCallback(async () => {
    if (content.length === 0) {
      throw new Error("Database is empty");
    }
    await exportDatabase(content);
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
