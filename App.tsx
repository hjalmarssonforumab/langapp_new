
import React, { useState } from 'react';
import { ExerciseConfig, SpellingDifficulty } from './types';
import PhonemeGame from './components/PhonemeGame';
import MatchingGame from './components/MatchingGame';
import SpellingGame from './components/SpellingGame';
import AdminDashboard from './components/AdminDashboard';
import LessonBuilder from './components/LessonBuilder';
import StartMenu from './components/StartMenu';
import SummaryScreen from './components/SummaryScreen';
import { useGameContent } from './hooks/useGameContent';

type GamePhase = 'START_MENU' | 'ADMIN' | 'LESSON_CREATOR' | 'PLAYING_LESSON' | 'SUMMARY';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('START_MENU');
  const [totalScore, setTotalScore] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('ru-RU');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const { content, lessonPlan, setLessonPlan, isImporting, addWord, updateWord, deleteWord, importData, exportData } = useGameContent();
  const activeContent = content.filter(c => c.language === currentLanguage);

  const startLesson = (plan: ExerciseConfig[]) => {
    setLessonPlan(plan);
    setCurrentExerciseIndex(0);
    setTotalScore(0);
    setPhase('PLAYING_LESSON');
  };

  const quickStart = (type: 'PHONEME' | 'MATCHING' | 'SPELLING') => {
    const validContent = activeContent.filter(c => c.audioBlob !== null);
    if(validContent.length === 0 && !confirm(`No audio recorded for ${currentLanguage}. Continue?`)) return;

    startLesson([{
      id: 'quick', type, wordIds: validContent.map(c => c.id),
      difficulty: 'LEVEL_1'
    }]);
  };

  const handleExerciseComplete = (score: number) => {
    setTotalScore(prev => prev + score);
    if (currentExerciseIndex < lessonPlan.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setPhase('SUMMARY');
    }
  };

  const renderExercise = () => {
    const config = lessonPlan[currentExerciseIndex];
    if (!config) return null;
    const exContent = activeContent.filter(c => config.wordIds.includes(c.id));
    const commonProps = { key: config.id, content: exContent, onComplete: handleExerciseComplete };

    switch (config.type) {
      case 'PHONEME': return <PhonemeGame {...commonProps} onExit={() => setPhase('START_MENU')} />;
      case 'MATCHING': return <MatchingGame {...commonProps} difficulty={config.difficulty as any} />;
      case 'SPELLING': return <SpellingGame {...commonProps} difficulty={config.difficulty as SpellingDifficulty} onExit={() => setPhase('START_MENU')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center py-8 px-4 font-sans text-slate-900">
      <main className="w-full flex justify-center">
        {phase === 'START_MENU' && (
          <StartMenu 
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onPhaseChange={setPhase}
            onQuickStart={quickStart}
          />
        )}

        {phase === 'ADMIN' && (
            <div className="w-full max-w-7xl">
                <AdminDashboard 
                    content={activeContent}
                    currentLanguage={currentLanguage}
                    onAdd={addWord} onUpdate={updateWord} onDelete={deleteWord}
                    onImport={importData} onExport={exportData} isImporting={isImporting}
                    onBack={() => setPhase('START_MENU')}
                />
            </div>
        )}

        {phase === 'LESSON_CREATOR' && (
            <LessonBuilder 
                content={activeContent} existingPlan={lessonPlan} onSavePlan={setLessonPlan}
                onStartLesson={startLesson} onImport={importData} onExport={exportData}
                onBack={() => setPhase('START_MENU')}
            />
        )}

        {phase === 'PLAYING_LESSON' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
             <div className="w-full flex items-center justify-between mb-8 px-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
                <div>Exercise {currentExerciseIndex + 1} of {lessonPlan.length}</div>
                <div>{lessonPlan[currentExerciseIndex].type}</div>
            </div>
            {renderExercise()}
          </div>
        )}

        {phase === 'SUMMARY' && (
          <SummaryScreen totalScore={totalScore} onRestart={() => setPhase('START_MENU')} />
        )}
      </main>
    </div>
  );
};

export default App;
