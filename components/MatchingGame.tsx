
import React, { useState, useEffect } from 'react';
import { GameContent, MatchingDifficulty } from '../types';
import { Volume2, CheckCircle2, MousePointer2, XCircle, RotateCcw } from 'lucide-react';

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
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [wordQueue, setWordQueue] = useState<GameContent[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const [isCorrectState, setIsCorrectState] = useState(false);
  const [isGlobalError, setIsGlobalError] = useState(false);
  const [errorWordId, setErrorWordId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  useEffect(() => {
    if (content.length === 0) return;

    // 1. Select up to 6 UNIQUE items for the visual grid
    const distinctItemsForGrid = [...content].sort(() => Math.random() - 0.5).slice(0, 6);

    // 2. Create GridItems with unique instance keys
    const gridWithIds: GridItem[] = distinctItemsForGrid.map((item, idx) => ({
        instanceId: `${item.id}-${idx}`,
        content: item
    }));

    // 3. Shuffle visual grid positions
    const shuffledGrid = [...gridWithIds].sort(() => Math.random() - 0.5);
    setGridItems(shuffledGrid);

    // 4. Create the question queue based on difficulty
    let queue: GameContent[] = [];

    if (difficulty === 'LEVEL_3') {
        // Level 3: Truly random sampling with replacement (duplicates allowed)
        if (distinctItemsForGrid.length > 0) {
            queue = Array.from({ length: 6 }).map(() => {
                const randomIndex = Math.floor(Math.random() * distinctItemsForGrid.length);
                return distinctItemsForGrid[randomIndex];
            });
        }
    } else {
        // Level 1 & 2: Permutation (Unique items, random order)
        queue = [...distinctItemsForGrid].sort(() => Math.random() - 0.5);
    }

    setWordQueue(queue);
    setCurrentQueueIndex(0);
    setSessionScore(0);
    
    // Debug log to verify Level 3 behavior
    if (difficulty === 'LEVEL_3') {
        const names = queue.map(c => c.word);
        const uniqueNames = new Set(names);
        console.log(`[Level 3 Gen] Queue: ${names.join(', ')} (Unique: ${uniqueNames.size}/6)`);
    }

  }, [content, difficulty]);

  const currentTargetItem = wordQueue[currentQueueIndex];
  const isGameComplete = wordQueue.length > 0 && currentQueueIndex >= wordQueue.length;

  useEffect(() => {
    if (isGameComplete) {
      const timer = setTimeout(() => {
        onComplete(sessionScore);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGameComplete, onComplete, sessionScore]);

  const playAudio = (blob: Blob | null) => {
    if (!blob) return;
    setIsPlaying(true);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(e => {
        console.error(e);
        setIsPlaying(false);
    });
  };

  const handleMainButtonClick = () => {
    if (isGlobalError) {
        // Reset error state when user decides to listen again
        setIsGlobalError(false);
        setErrorWordId(null);
    }
    
    if (currentTargetItem && currentTargetItem.audioBlob) {
        playAudio(currentTargetItem.audioBlob);
    }
  };

  // NOTE: Auto-play effect removed as requested. 
  // User must manually click to hear the first word of a turn.

  const handleImageClick = (clickedItem: GameContent) => {
    // Block interaction if currently playing success animation or game is done
    // NOTE: We DO allow clicking if isGlobalError is true, effectively resetting the error if they pick another card,
    // BUT based on requirements "play button shall still stay red", usually implies we want them to click the button.
    // However, standard UX allows correcting the answer immediately. 
    // Let's allow guessing again immediately, but if they guess wrong again, it stays red.
    if (isCorrectState || isGameComplete) return;

    if (clickedItem.id === currentTargetItem.id) {
      // --- CORRECT ANSWER ---
      setIsCorrectState(true);
      setIsGlobalError(false); // Clear any persistent error
      setErrorWordId(null);
      setSessionScore(s => s + 1);
      
      // Play the audio again as reinforcement
      if (currentTargetItem.audioBlob) {
          playAudio(currentTargetItem.audioBlob);
      }
      
      setTimeout(() => {
        setIsCorrectState(false);
        setCurrentQueueIndex(prev => prev + 1);
        // We do NOT play the next audio here. User must click the button.
      }, 1500); 
    } else {
      // --- WRONG ANSWER ---
      setErrorWordId(clickedItem.id);
      setIsGlobalError(true); 
      // We do NOT set a timeout to clear the error. It stays red until user interaction.
    }
  };

  if (content.length === 0) {
     return <div className="text-center p-8 text-slate-500">No items available.</div>;
  }

  if (isGameComplete) {
      return (
          <div className="flex flex-col items-center justify-center p-12 h-96 animate-pulse">
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-800">Set Complete!</h2>
          </div>
      );
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6">
       
       <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <MousePointer2 className="text-blue-500" size={20} />
            Select the Image
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-medium uppercase tracking-wide">
            Question {currentQueueIndex + 1} of {wordQueue.length}
        </p>
        {difficulty !== 'LEVEL_1' && (
           <span className={`text-[10px] px-3 py-1 rounded-full mt-2 inline-block font-bold tracking-wide ${
               difficulty === 'LEVEL_3' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
           }`}>
              {difficulty === 'LEVEL_2' ? 'Hard Mode: Cards stay active' : 'Expert Mode: Random repeats'}
           </span>
        )}
       </div>

       {/* Main Audio Button */}
       <div className="relative">
         <button
            onClick={handleMainButtonClick}
            className={`
                w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300
                ${isCorrectState 
                    ? 'bg-green-500 text-white scale-110 ring-4 ring-green-200' 
                    : isGlobalError 
                        ? 'bg-red-500 text-white scale-110 ring-4 ring-red-200 animate-shake'
                        : 'bg-white text-blue-600 hover:scale-105 hover:text-blue-500'
                }
                ${isPlaying && !isGlobalError && !isCorrectState ? 'ring-4 ring-blue-200 scale-105' : ''}
            `}
         >
            {isCorrectState ? (
                <CheckCircle2 size={40} />
            ) : isGlobalError ? (
                <RotateCcw size={40} />
            ) : (
                <Volume2 size={40} className={isPlaying ? 'animate-pulse' : ''} />
            )}
         </button>
         <div className={`text-center mt-2 text-xs font-bold uppercase tracking-wider transition-colors ${isGlobalError ? 'text-red-500' : 'text-slate-400'}`}>
            {isCorrectState ? 'Correct!' : isGlobalError ? 'Try Again' : isPlaying ? 'Playing...' : 'Click to Listen'}
         </div>
       </div>

       {/* The Grid */}
       <div className="grid grid-cols-3 gap-3 w-full">
          {gridItems.map((item) => {
             // Level 1: Gray out completed words from previous turns
             // Level 2 & 3: Never gray out (always active)
             
             const isWordCompleted = difficulty === 'LEVEL_1' && 
                wordQueue.slice(0, currentQueueIndex).some(q => q.id === item.content.id);

             const isError = errorWordId === item.content.id;
             const isCurrentTarget = currentTargetItem && item.content.id === currentTargetItem.id;
             const showSuccess = isCorrectState && isCurrentTarget;

             return (
               <button
                 key={item.instanceId}
                 onClick={() => handleImageClick(item.content)}
                 disabled={isWordCompleted || isCorrectState}
                 className={`
                   aspect-square rounded-xl flex items-center justify-center transition-all border-2 shadow-sm overflow-hidden
                   ${isWordCompleted 
                      ? 'bg-slate-50 border-slate-100 opacity-20 cursor-default grayscale' 
                      : showSuccess
                          ? 'bg-green-100 border-green-500 scale-105 ring-2 ring-green-200 z-10'
                          : isError
                              ? 'bg-red-50 border-red-400 animate-shake'
                              : 'bg-white border-slate-200 hover:border-blue-300 hover:scale-105 hover:shadow-lg'
                   }
                 `}
               >
                 {item.content.isImageFile ? (
                    <img src={item.content.image} alt={item.content.word} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-4xl">{item.content.image}</span>
                 )}
               </button>
             );
          })}
       </div>
    </div>
  );
};

export default MatchingGame;
