// Environment detection utilities
export const isProduction = import.meta.env.PROD || import.meta.env.VITE_SQUARE_ENVIRONMENT === 'production';
export const isDevelopment = import.meta.env.DEV && import.meta.env.VITE_SQUARE_ENVIRONMENT !== 'production';

export const getEnvironmentName = () => {
  return isProduction ? 'production' : 'sandbox';
};

export const getEnvironmentBadge = () => {
  return isProduction 
    ? { text: 'LIVE', color: 'bg-green-600' } 
    : { text: 'SANDBOX', color: 'bg-yellow-600' };
};