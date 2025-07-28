// Environment detection utilities
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const getEnvironmentName = () => {
  return isProduction ? 'production' : 'sandbox';
};

export const getEnvironmentBadge = () => {
  return isProduction 
    ? { text: 'LIVE', color: 'bg-green-600' } 
    : { text: 'SANDBOX', color: 'bg-yellow-600' };
};