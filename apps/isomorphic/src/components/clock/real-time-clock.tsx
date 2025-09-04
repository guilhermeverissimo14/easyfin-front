'use client';

import { useState, useEffect } from 'react';
import { Text } from 'rizzui';
import cn from '@core/utils/class-names';

interface RealTimeClockProps {
  className?: string;
  showSeconds?: boolean;
}

export default function RealTimeClock({ className, showSeconds = true }: RealTimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: false
    };
    return date.toLocaleTimeString('pt-BR', options);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', options).toLowerCase();
  };

  return (
   <div
    className={cn(
      'inline-block rounded-lg px-4 py-2',
      'bg-gray-600 text-center shadow-lg'
    )}
  >
    <Text
      className={cn(
        'text-lg font-mono font-bold tracking-widest',
        'text-green-300', 
        'animate-pulse'  
      )}
    >
      {formatTime(currentTime)}
    </Text>
    <Text className="text-xs text-gray-100">
      {formatDate(currentTime)}
    </Text>
  </div>
);

}