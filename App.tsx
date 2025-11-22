
import React, { useState } from 'react';
import { GameContent, ExerciseConfig } from './types';
import PhonemeGame from './components/PhonemeGame';
import MatchingGame from './components/MatchingGame';
import AdminDashboard from './components/AdminDashboard';
import LessonBuilder from './components/LessonBuilder';
import { useGameContent } from './hooks/useGameContent';
import { Trophy, RefreshCw, Ear, Shapes, Play, Settings, ListMusic } from 'lucide-react';

enum GamePhase {
  START_MENU,
  ADMIN,
  LESSON_CREATOR,
  PLAYING_LESSON,
  SUMMARY
}

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START_MENU);
  const [totalScore, setTotalScore] = useState(0);
  
  // Lesson State
  const [lessonPlan, setLessonPlan] = useState<ExerciseConfig[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const { 
    content, 
    isImporting, 
    addWord, 
    updateWord, 
    deleteWord, 
    importData, 
    exportData 
  } = useGameContent();

  // --- Helper to start a single game mode as a quick start ---
  const quickStart = (type: 'PHONEME' | 'MATCHING') => {
    const validContent = content.filter(c => c.audioBlob !== null);
    if(validContent.length === 0) {
        if(!confirm("No audio recorded yet. Games will be silent. Continue?")) return;
    }

    const config: ExerciseConfig = {
      id: 'quick-start',
      type,
      wordIds: validContent.map(c => c.id), // Use all words for quick start
      difficulty: type === 'MATCHING' ? 'LEVEL_1' : undefined
    };

    setLessonPlan([config]);
    setCurrentExerciseIndex(0);
    setTotalScore(0);
    setPhase(GamePhase.PLAYING_LESSON);
  };

  const startCustomLesson = (plan: ExerciseConfig[]) => {
    setLessonPlan(plan);
    setCurrentExerciseIndex(0);
    setTotalScore(0);
    setPhase(GamePhase.PLAYING_LESSON);
  };

  const handleExerciseComplete = (score: number) => {
    setTotalScore(prev => prev + score);
    
    if (currentExerciseIndex < lessonPlan.length - 1) {
      // Move to next exercise
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // All done
      setPhase(GamePhase.SUMMARY);
    }
  };

  const restartGame = () => {
    setTotalScore(0);
    setPhase(GamePhase.START_MENU);
  };

  // --- Render Logic for the Active Lesson ---
  const renderCurrentExercise = () => {
    const currentConfig = lessonPlan[currentExerciseIndex];
    if (!currentConfig) return null;

    // Filter content to only include the words selected for this specific exercise
    const exerciseContent = content.filter(c => currentConfig.wordIds.includes(c.id));

    if (currentConfig.type === 'PHONEME') {
      return (
        <PhonemeGame 
          key={currentConfig.id} // Force remount on step change
          content={exerciseContent} 
          onComplete={handleExerciseComplete}
          onExit={restartGame}
        />
      );
    } else {
      return (
        <MatchingGame 
          key={currentConfig.id}
          content={exerciseContent}
          difficulty={currentConfig.difficulty || 'LEVEL_1'}
          onComplete={handleExerciseComplete} 
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-900">
      
      <main className="w-full flex justify-center">
        
        {phase === GamePhase.START_MENU && (
          <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-4xl">
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">Svenska Ljud</h1>
              <p className="text-xl text-slate-500 max-w-md mx-auto">Master Swedish pronunciation.</p>
            </div>
            
            <div className="w-full max-w-2xl flex justify-end gap-2">
                 <button 
                    onClick={() => setPhase(GamePhase.LESSON_CREATOR)}
                    className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold uppercase tracking-widest px-4 py-2 rounded-full shadow-md hover:shadow-lg"
                >
                    <ListMusic size={16} /> Lesson Creator
                </button>
                <button 
                    onClick={() => setPhase(GamePhase.ADMIN)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
                >
                    <Settings size={16} /> Database
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <button 
                onClick={() => quickStart('PHONEME')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all hover:-translate-y-1"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Ear size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-2">Quick Phoneme</h3>
                <p className="text-slate-500 text-sm">Practice with all available words.</p>
                <div className="mt-6 flex items-center justify-center text-blue-600 font-semibold text-sm uppercase tracking-wider">
                  Start <Play size={16} className="ml-2 fill-current" />
                </div>
              </button>

              <button 
                onClick={() => quickStart('MATCHING')}
                className="group relative bg-white p-8 rounded-3xl shadow-xl border-2 border-transparent hover:border-purple-500 transition-all hover:-translate-y-1"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Shapes size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mt-4 mb-2">Quick Matching</h3>
                <p className="text-slate-500 text-sm">Match audio to images (all words).</p>
                <div className="mt-6 flex items-center justify-center text-purple-600 font-semibold text-sm uppercase tracking-wider">
                  Start <Play size={16} className="ml-2 fill-current" />
                </div>
              </button>
            </div>
          </div>
        )}

        {phase === GamePhase.ADMIN && (
            <div className="w-full max-w-7xl">
                <AdminDashboard 
                    content={content}
                    onAdd={addWord}
                    onUpdate={updateWord}
                    onDelete={deleteWord}
                    onImport={importData}
                    onExport={exportData}
                    isImporting={isImporting}
                    onBack={() => setPhase(GamePhase.START_MENU)}
                />
            </div>
        )}

        {phase === GamePhase.LESSON_CREATOR && (
            <LessonBuilder 
                content={content}
                onStartLesson={startCustomLesson}
                onBack={() => setPhase(GamePhase.START_MENU)}
            />
        )}

        {phase === GamePhase.PLAYING_LESSON && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            
            {/* Lesson Progress Header */}
            <div className="w-full flex items-center justify-between mb-8 px-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                <div>Exercise {currentExerciseIndex + 1} of {lessonPlan.length}</div>
                <div>{lessonPlan[currentExerciseIndex].type}</div>
            </div>

            {renderCurrentExercise()}
          </div>
        )}

        {phase === GamePhase.SUMMARY && (
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <Trophy className="w-24 h-24 text-yellow-400 mb-6 drop-shadow-md" />
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Congratulations!</h1>
            <p className="text-slate-500 mb-8">You have completed the lesson.</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 w-full mb-8 border border-slate-100">
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">Total Score</div>
              <div className="text-6xl font-black text-blue-600">{totalScore}</div>
              <div className="text-slate-400 text-sm mt-2">Great Job!</div>
            </div>

            <button 
              onClick={restartGame}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw size={20} />
              Back to Menu
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
