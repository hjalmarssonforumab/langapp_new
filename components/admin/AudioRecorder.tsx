import React from 'react';
import { Mic, Square, Play, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface AudioRecorderProps {
  audioBlob: Blob | null;
  onAudioChange: (blob: Blob | null) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ audioBlob, onAudioChange }) => {
  const recorder = useAudioRecorder();

  React.useEffect(() => {
    // Sync local recorder state to parent form state
    if (recorder.audioBlob) {
      onAudioChange(recorder.audioBlob);
    }
  }, [recorder.audioBlob, onAudioChange]);

  const playCurrentAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    }
  };

  const handleDeleteAudio = () => {
      recorder.clearRecording();
      onAudioChange(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-500 uppercase">
            Pronunciation
        </label>
        
        {audioBlob ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Recorded
            </span>
        ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                <AlertCircle size={12} /> Required
            </span>
        )}
      </div>

      <div className="flex gap-2">
        {/* Record Button */}
        <button
          type="button"
          onClick={recorder.isRecording ? recorder.stopRecording : recorder.startRecording}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all
            ${recorder.isRecording 
              ? 'bg-red-500 text-white animate-pulse shadow-lg' 
              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
            }
          `}
        >
          {recorder.isRecording ? <Square size={16} /> : <Mic size={16} />}
          {recorder.isRecording ? 'Stop Rec' : 'Record'}
        </button>

        {/* Play Button */}
        <button 
            type="button"
            onClick={playCurrentAudio}
            disabled={!audioBlob || recorder.isRecording}
            className="w-12 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Play Recording"
        >
            <Play size={20} fill="currentColor" />
        </button>

        {/* Delete/Clear Button */}
        <button 
            type="button"
            onClick={handleDeleteAudio}
            disabled={!audioBlob || recorder.isRecording}
            className="w-12 flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Delete Recording"
        >
            <Trash2 size={18} />
        </button>
      </div>
      
      {recorder.isRecording && (
          <div className="mt-2 text-center text-xs text-red-500 font-medium animate-pulse">
              Recording in progress... speak clearly
          </div>
      )}
    </div>
  );
};

export default AudioRecorder;