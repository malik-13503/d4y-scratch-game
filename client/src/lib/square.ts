// Square Web SDK integration for real payment processing
declare global {
  interface Window {
    Square: any;
  }
}

export const loadSquareSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Square) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
};

export const initializeSquarePayments = async () => {
  await loadSquareSDK();
  
  // Use production or sandbox application ID based on environment
  let appId;
  let environment;
  
  // Check if we should use production mode
  const isProduction = import.meta.env.PROD || import.meta.env.VITE_SQUARE_ENVIRONMENT === 'production';
  
  if (isProduction) {
    // Use production Application ID provided by user
    appId = "sq0idp-eEHVCg_ooCtmo7320ezdZw";
    environment = "production";
  } else {
    // Use sandbox Application ID if available
    appId = import.meta.env.VITE_SQUARE_APPLICATION_ID;
    environment = "sandbox";
  }
    
  if (!appId) {
    throw new Error('Square Application ID not configured');
  }

  const payments = window.Square.payments(appId, environment);
  return payments;
};

export const createCardPaymentMethod = async () => {
  const payments = await initializeSquarePayments();
  
  const card = await payments.card({
    style: {
      '.input-container': {
        borderColor: '#E5E7EB',
        borderRadius: '6px',
      },
      '.input-container.is-focus': {
        borderColor: '#3B82F6',
      },
      '.input-container.is-error': {
        borderColor: '#EF4444',
      },
      '.message-text': {
        color: '#EF4444',
      },
      'input': {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
      }
    }
  });

  return card;
};