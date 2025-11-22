
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateIconForWord = async (word: string, language: string = 'Swedish'): Promise<string> => {
  const maxRetries = 2;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              text: `Generate a modern icon representing the meaning of the ${language} word "${word}".
CRITICAL RULES:
1. No text, letters, or typography in the image.
2. For abstract words, use a clean, simple symbolic representation.
3. Style: Semi-3D, soft gradients, subtle shadows, rounded forms, white background.
4. Subject: One clear object or symbol, centered and prominent.
5. No harsh cartoon outlines, no complex illustration details.
6. Icon format: Close-up, minimal composition, keeping a friendly and simple look.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      // Iterate to find the image part
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempts} failed to generate image:`, error);
      if (attempts >= maxRetries) throw error;
    }
  }
  
  throw new Error("No image generated.");
};

// Kept for fallback if needed, though we are shifting to user recording
export const generatePronunciation = async (text: string): Promise<string> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say the word: ${text}` }] }],
        config: {
          // FIXED: Use Modality.AUDIO instead of string "AUDIO"
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are a pronunciation engine. Speak the requested word clearly and naturally.",
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }, 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received.");
      }
      return base64Audio;
    } catch (error: any) {
      attempt++;
      const isInternalError = error.message?.includes('500') || error.status === 500;
      if (isInternalError && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate audio");
};
