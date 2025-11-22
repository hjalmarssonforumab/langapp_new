/**
 * Decodes Base64 encoded raw PCM data into an AudioBuffer.
 */
export const decodeAudioData = async (
  base64Data: string,
  audioContext: AudioContext,
  sampleRate = 24000 // Default for Gemini TTS
): Promise<AudioBuffer> => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  
  const buffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Convert Int16 to Float32 (-1.0 to 1.0)
    channelData[i] = dataInt16[i] / 32768.0;
  }

  return buffer;
};

/**
 * Plays an audio buffer.
 */
export const playBuffer = (audioContext: AudioContext, buffer: AudioBuffer): void => {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
};
