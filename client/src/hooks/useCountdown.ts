import { useState, useEffect, useCallback, useMemo } from 'react';

export function useCountdown(targetDate: string | Date) {
  // Initialize with a stable default state
  const [timeLeft, setTimeLeft] = useState(() => ({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  }));

  // Memoize the target time to prevent unnecessary re-renders
  const targetTime = useMemo(() => {
    return new Date(targetDate).getTime();
  }, [targetDate]);

  // Memoize the calculation function
  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      };
    } else {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }
  }, [targetTime]);

  useEffect(() => {
    // Set initial value
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Clear interval if expired
      if (newTimeLeft.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return timeLeft;
}