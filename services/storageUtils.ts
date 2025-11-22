
import { GameContent, ExerciseConfig } from '../types';
import { generateId } from './idUtils';

interface SerializableGameContent extends Omit<GameContent, 'audioBlob'> {
  audioBase64: string | null;
}

interface DatabaseFile {
  version: number;
  content: SerializableGameContent[];
  lessonPlan: ExerciseConfig[];
}

/**
 * Converts a Blob to a Base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the Data-URL declaration
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
 * Exports the current game content and lesson plan to a JSON file.
 */
export const exportDatabase = async (content: GameContent[], lessonPlan: ExerciseConfig[]) => {
  // Serialize Content (Convert Blobs to Base64)
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

  // Create the combined export object
  const exportObject: DatabaseFile = {
    version: 2,
    content: serializableContent,
    lessonPlan: lessonPlan
  };

  const dataStr = JSON.stringify(exportObject, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `polyglot-trainer-full-${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Imports a JSON file and returns the parsed data.
 * Handles both old format (Array<GameContent>) and new format (DatabaseFile).
 */
export const importDatabase = (file: File): Promise<{ content: GameContent[], lessonPlan: ExerciseConfig[] }> => {
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

        let rawContent: any[] = [];
        let rawPlan: ExerciseConfig[] = [];

        // Detect Format
        if (Array.isArray(parsed)) {
            // Old format: just the content array
            rawContent = parsed;
        } else if (parsed.content && Array.isArray(parsed.content)) {
            // New format: Object with content and optional lessonPlan
            rawContent = parsed.content;
            if (parsed.lessonPlan && Array.isArray(parsed.lessonPlan)) {
                rawPlan = parsed.lessonPlan;
            }
        } else {
            throw new Error("Unknown file format.");
        }

        // --- Process Content ---
        const seenIds = new Set<string>();

        const restoredContent: GameContent[] = rawContent.map((item: any, index: number) => {
          if (!item.word) {
             console.warn(`Skipping invalid item at index ${index}`, item);
             return null;
          }

          let safeId = (item.id !== undefined && item.id !== null) ? String(item.id) : generateId();
          if (seenIds.has(safeId)) { safeId = generateId(); }
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
            distractors: Array.isArray(item.distractors) ? item.distractors : [], 
            image: item.image || '',
            isImageFile: !!item.isImageFile,
            category: item.category || 'custom',
            language: item.language || 'sv-SE',
            audioBlob: restoredBlob
          };
        }).filter((item): item is GameContent => item !== null);

        if (restoredContent.length === 0 && rawContent.length > 0) {
            throw new Error("No valid words could be recovered from the file.");
        }

        resolve({ 
            content: restoredContent, 
            lessonPlan: rawPlan 
        });

      } catch (error) {
        reject(error instanceof Error ? error : new Error("Unknown error during import."));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file. Please try again."));
    reader.readAsText(file);
  });
};
