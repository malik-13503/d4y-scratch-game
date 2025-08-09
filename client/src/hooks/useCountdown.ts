import { useState, useEffect, useRef } from 'react';

export function useCountdown(targetDate: string | Date) {
  // Always initialize with the same state structure
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  // Use ref to store the target time to avoid dependency issues
  const targetTimeRef = useRef<number>(0);
  
  // Update target time when it changes
  useEffect(() => {
    targetTimeRef.current = new Date(targetDate).getTime();
  }, [targetDate]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetTimeRef.current - now;

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
    };

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    // Set up interval
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(prev => {
        // Only update if values actually changed to prevent unnecessary re-renders
        if (prev.days !== newTimeLeft.days || 
            prev.hours !== newTimeLeft.hours || 
            prev.minutes !== newTimeLeft.minutes || 
            prev.seconds !== newTimeLeft.seconds ||
            prev.isExpired !== newTimeLeft.isExpired) {
          return newTimeLeft;
        }
        return prev;
      });
      
      // Clear interval if expired
      if (newTimeLeft.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array - interval will use the latest targetTimeRef.current

  return timeLeft;
}