'use client';

import { useState, useEffect, useCallback } from 'react';

interface SessionTimerProps {
  initialSeconds: number; // 50 minutes = 3000 seconds
  onTimeUp: () => void;
  onWarning?: (minutesLeft: number) => void;
}

export function SessionTimer({
  initialSeconds,
  onTimeUp,
  onWarning,
}: SessionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [warningsGiven, setWarningsGiven] = useState<number[]>([]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  // Check for warnings
  useEffect(() => {
    const minutesLeft = Math.ceil(secondsLeft / 60);
    const warningTimes = [10, 5, 1];

    warningTimes.forEach((warningTime) => {
      if (
        minutesLeft === warningTime &&
        !warningsGiven.includes(warningTime) &&
        secondsLeft <= warningTime * 60
      ) {
        setWarningsGiven((prev) => [...prev, warningTime]);
        onWarning?.(warningTime);
      }
    });
  }, [secondsLeft, warningsGiven, onWarning]);

  // Color based on time remaining
  const getColorClass = () => {
    if (secondsLeft <= 60) return 'text-red-600 bg-red-100';
    if (secondsLeft <= 300) return 'text-orange-600 bg-orange-100';
    if (secondsLeft <= 600) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${getColorClass()}`}
    >
      {formatTime(secondsLeft)}
    </div>
  );
}
