
import { GameContent } from '../types';

interface SerializableGameContent extends Omit<GameContent, 'audioBlob'> {
  audioBase64: string | null;
}

/**
 * Converts a Blob to a Base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the Data-URL declaration (e.g., "data:audio/webm;base64,") to just get the base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Converts a Base64 string back to a Blob.
 */
const base64ToBlob = (base64: string, mimeType: string = 'audio/webm'): Blob => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (e) {
    console.error("Failed to decode base64 audio string", e);
    throw new Error("Audio data corrupted");
  }
};

/**
 * Exports the current game content state to a JSON file downloadable by the user.
 */
export const exportDatabase = async (content: GameContent[]) => {
  const serializableContent: SerializableGameContent[] = await Promise.all(
    content.map(async (item) => {
      let audioBase64 = null;
      if (item.audioBlob) {
        audioBase64 = await blobToBase64(item.audioBlob);
      }
      return {
        ...item,
        audioBlob: undefined, // Remove blob from serializable object
        audioBase64: audioBase64
      };
    })
  );

  const dataStr = JSON.stringify(serializableContent, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `swedish-trainer-db-${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Imports a JSON file and converts it back into usable GameContent.
 */
export const importDatabase = (file: File): Promise<GameContent[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        if (!json) throw new Error("File is empty");

        let parsed: any;
        try {
            parsed = JSON.parse(json);
        } catch (e) {
            throw new Error("Invalid JSON format. The file might be corrupted.");
        }

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid database structure. Expected a list of items.");
        }

        // Used to ensure unique IDs within this import batch
        const seenIds = new Set<string>();

        const restoredContent: GameContent[] = parsed.map((item: any, index: number) => {
          // Basic validation to ensure critical fields exist
          if (!item.word) {
             console.warn(`Skipping invalid item at index ${index}`, item);
             return null;
          }

          // Ensure ID is a unique string. If missing or duplicate, generate a new one.
          let safeId = String(item.id || Date.now() + index);
          if (seenIds.has(safeId)) {
              safeId = safeId + '-' + index;
          }
          seenIds.add(safeId);

          let restoredBlob: Blob | null = null;
          if (item.audioBase64) {
             try {
                 restoredBlob = base64ToBlob(item.audioBase64);
             } catch (e) {
                 console.warn(`Could not restore audio for word: ${item.word}`);
             }
          }

          return {
            id: safeId,
            word: item.word,
            highlight: item.highlight || '',
            phonemeDisplay: item.phonemeDisplay || '?',
            distractors: Array.isArray(item.distractors) ? item.distractors : [], // Ensure array
            image: item.image || '',
            isImageFile: !!item.isImageFile,
            category: item.category || 'custom',
            audioBlob: restoredBlob
          };
        }).filter((item): item is GameContent => item !== null);

        if (restoredContent.length === 0 && parsed.length > 0) {
            throw new Error("No valid words could be recovered from the file.");
        }

        resolve(restoredContent);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Unknown error during import."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file. Please try again."));
    reader.readAsText(file);
  });
};
