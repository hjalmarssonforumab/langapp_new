
import { useState, useEffect, useCallback } from 'react';
import { GameContent } from '../types';

interface UseGameSessionProps {
  content: GameContent[];
  onComplete: (score: number) => void;
  shuffled?: boolean;
}

export const useGameSession = ({ content, onComplete, shuffled = true }: UseGameSessionProps) => {
  const [queue, setQueue] = useState<GameContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  useEffect(() => {
    if (content.length > 0) {
      const newQueue = shuffled ? [...content].sort(() => Math.random() - 0.5) : content;
      setQueue(newQueue);
      setCurrentIndex(0);
      setSessionScore(0);
      setIsSessionActive(true);
    }
  }, [content, shuffled]);

  const currentItem = queue[currentIndex];
  const progress = queue.length > 0 ? ((currentIndex) / queue.length) * 100 : 0;

  const addScore = useCallback((points: number = 1) => {
    setSessionScore(prev => prev + points);
  }, []);

  const nextItem = useCallback(() => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsSessionActive(false);
      onComplete(sessionScore);
    }
  }, [currentIndex, queue.length, sessionScore, onComplete]);

  return {
    queue,
    currentIndex,
    currentItem,
    sessionScore,
    progress,
    addScore,
    nextItem
  };
};
