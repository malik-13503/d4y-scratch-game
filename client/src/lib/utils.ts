import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeRemaining(endTime: string | Date): string {
  const now = new Date().getTime();
  const end = typeof endTime === 'string' ? new Date(endTime).getTime() : endTime.getTime();
  const difference = end - now;

  if (difference <= 0) {
    return "Game ended";
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function generateGameCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const prefix = letters.charAt(Math.floor(Math.random() * letters.length)) + 
                 letters.charAt(Math.floor(Math.random() * letters.length));
  const suffix = Array.from({ length: 3 }, () => 
    numbers.charAt(Math.floor(Math.random() * numbers.length))
  ).join('');
  
  return `${prefix}.${suffix}`;
}