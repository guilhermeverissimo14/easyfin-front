'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { userType } from '@/types';

interface WelcomeMessageProps {
  className?: string;
}

export default function WelcomeMessage({ className }: WelcomeMessageProps) {
  const [user, setUser] = useState<userType | null>(null);
   const hour = new Date().getHours();

  useEffect(() => {
    const userCache = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;
    setUser(userCache);
  }, []);

  const getGreeting = () => {
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getEmoji = () => {
    if (hour < 12) return '🌞';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  const firstName = user?.name?.split(' ')[0] || '';

  return (
     <div className={cn('flex items-baseline justify-center gap-2', className)}>
      <motion.span
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-base font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"
      >
        {getEmoji()} {getGreeting()},
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base ml-6 font-semibold bg-gradient-to-r from-green-500 to-green-800 bg-clip-text text-transparent"
      >
        {firstName}!
      </motion.span>
    </div>
  );
}