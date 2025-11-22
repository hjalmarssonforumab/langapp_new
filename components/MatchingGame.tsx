
import React, { useState, useEffect } from 'react';
import { GameContent, MatchingDifficulty } from '../types';
import { Volume2, CheckCircle2, MousePointer2, RotateCcw } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface MatchingGameProps {
  content: GameContent[];
  difficulty?: MatchingDifficulty;
  onComplete: (scoreToAdd: number) => void;
}

interface GridItem {
  instanceId: string;
  content: GameContent;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ content, difficulty = 'LEVEL_1', onComplete }) => {
  const { isPlaying, playAudio } = useAudioPlayer();
  
  // Grid State
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  
  // Logic State
  const [wordQueue, setWordQueue] = useState<GameContent[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  
  // Level 3 Specific State
  const [unusedPool, setUnusedPool] = useState<GameContent[]>([]);
  const [dynamicTarget, setDynamicTarget] = useState<GameContent | null>(null);
  const [level3CorrectCount, setLevel3CorrectCount] = useState(0);
  const [level3TotalGoal, setLevel3TotalGoal] = useState(0);

  // Interaction State
  const [isCorrectState, setIsCorrectState] = useState(false);
  const [isGlobalError, setIsGlobalError] = useState(false);
  const [errorWordId, setErrorWordId] = useState<string | null>(null);
  const [sessionScore, setSessionScore] = useState(0);

  useEffect(() => {
    if (content.length === 0) return;

    setSessionScore(0);
    setIsCorrectState(false);
    setIsGlobalError(false);
    setErrorWordId(null);
    setCurrentQueueIndex(0);
    setLevel3CorrectCount(0);

    if (difficulty === 'LEVEL_3') {
        const shuffled = [...content].sort(() => Math.random() - 0.5);
        const initialGrid = shuffled.slice(0, 6);
        const pool = shuffled.slice(6);

        setGridItems(initialGrid.map((item, idx) => ({ instanceId: `${item.id}-${idx}`, content: item })));
        setUnusedPool(pool);
        setLevel3TotalGoal(Math.max(6, content.length - 6));
        setDynamicTarget(initialGrid[Math.floor(Math.random() * initialGrid.length)]);
    } else {
        const distinct = [...content].sort(() => Math.random() - 0.5).slice(0, 6);
        setGridItems(distinct.map((item, idx) => ({ instanceId: `${item.id}-${idx}`, content: item })).sort(() => Math.random() - 0.5));
        setWordQueue([...distinct].sort(() => Math.random() - 0.5));
    }
  }, [content, difficulty]);

  const currentTargetItem = difficulty === 'LEVEL_3' ? dynamicTarget : wordQueue[currentQueueIndex];

  const isGameComplete = difficulty === 'LEVEL_3'
    ? level3CorrectCount >= level3TotalGoal
    : (wordQueue.length > 0 && currentQueueIndex >= wordQueue.length);

  useEffect(() => {
    if (isGameComplete) {
      setTimeout(() => onComplete(sessionScore), 1000);
    }
  }, [isGameComplete, onComplete, sessionScore]);

  const handleMainButtonClick = () => {
    if (isGlobalError) {
        setIsGlobalError(false);
        setErrorWordId(null);
    }
    playAudio(currentTargetItem?.audioBlob || null);
  };

  const handleImageClick = (clickedItem: GameContent) => {
    if (isCorrectState || isGameComplete) return;

    if (clickedItem.id === currentTargetItem?.id) {
      // Correct
      setIsCorrectState(true);
      setIsGlobalError(false);
      setErrorWordId(null);
      setSessionScore(s => s + 1);
      playAudio(currentTargetItem.audioBlob);
      
      setTimeout(() => {
        setIsCorrectState(false);

        if (difficulty === 'LEVEL_3') {
            setLevel3CorrectCount(prev => prev + 1);
            const gridIndex = gridItems.findIndex(g => g.content.id === clickedItem.id);
            let newGrid = [...gridItems];
            
            // Swap in new word from pool if available
            if (unusedPool.length > 0) {
                const nextPool = [...unusedPool];
                const newItem = nextPool.shift()!;
                if (gridIndex !== -1) newGrid[gridIndex] = { instanceId: `${newItem.id}-${Date.now()}`, content: newItem };
                setUnusedPool(nextPool);
            }
            setGridItems(newGrid);
            // Pick new target
            setDynamicTarget(newGrid[Math.floor(Math.random() * newGrid.length)].content);
        } else {
            setCurrentQueueIndex(prev => prev + 1);
        }
      }, 1500); 
    } else {
      setErrorWordId(clickedItem.id);
      setIsGlobalError(true); 
    }
  };

  if (content.length === 0) return <div className="text-center p-8 text-slate-500">No items available.</div>;
  if (isGameComplete) return <div className="flex justify-center p-12 h-96 animate-pulse"><CheckCircle2 className="w-20 h-20 text-green-500" /></div>;

  const currentStep = difficulty === 'LEVEL_3' ? level3CorrectCount : currentQueueIndex;
  const totalSteps = difficulty === 'LEVEL_3' ? level3TotalGoal : wordQueue.length;

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
       <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2"><MousePointer2 className="text-purple-500" size={20} /> Select the Image</h2>
        <p className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wide">Question {currentStep + 1} of {totalSteps}</p>
        {difficulty !== 'LEVEL_1' && <span className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full mt-2 inline-block font-bold">{difficulty === 'LEVEL_2' ? 'Hard Mode' : 'Expert Mode'}</span>}
       </div>

       <button
          onClick={handleMainButtonClick}
          className={`
              w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300
              ${isCorrectState ? 'bg-green-500 text-white scale-110' : isGlobalError ? 'bg-red-500 text-white animate-shake' : 'bg-white text-purple-600 hover:scale-105'}
          `}
       >
          {isCorrectState ? <CheckCircle2 size={40} /> : isGlobalError ? <RotateCcw size={40} /> : <Volume2 size={40} className={isPlaying ? 'animate-pulse' : ''} />}
       </button>

       <div className="grid grid-cols-3 gap-3 w-full">
          {gridItems.map((item) => {
             const isCompleted = difficulty === 'LEVEL_1' && wordQueue.slice(0, currentQueueIndex).some(q => q.id === item.content.id);
             const isError = errorWordId === item.content.id;
             const showSuccess = isCorrectState && item.content.id === currentTargetItem?.id;

             return (
               <button
                 key={item.instanceId}
                 onClick={() => handleImageClick(item.content)}
                 disabled={isCompleted || isCorrectState}
                 className={`
                   aspect-square rounded-xl flex items-center justify-center transition-all border-2 shadow-sm overflow-hidden
                   ${isCompleted ? 'opacity-20 grayscale' : showSuccess ? 'bg-green-100 border-green-500 scale-105' : isError ? 'bg-red-50 border-red-400 animate-shake' : 'bg-white border-slate-200 hover:border-purple-300'}
                 `}
               >
                 {item.content.isImageFile ? <img src={item.content.image} className="w-full h-full object-cover" /> : <span className="text-4xl">{item.content.image}</span>}
               </button>
             );
          })}
       </div>
    </div>
  );
};

export default MatchingGame;
