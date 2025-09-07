import { useState, useEffect } from 'react';
import { formatTimeRemaining, isDealExpired } from '../utils/helpers';

export const useCountdown = (endTime) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const updateCountdown = () => {
      const expired = isDealExpired(endTime);
      setIsExpired(expired);
      
      if (expired) {
        setTimeLeft('Expired');
        return;
      }

      setTimeLeft(formatTimeRemaining(endTime));
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return { timeLeft, isExpired };
};
