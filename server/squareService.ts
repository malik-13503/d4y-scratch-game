import { randomUUID } from "crypto";

// Enhanced Square service implementation with Card on File support
export class SquareService {
  private accessToken: string;
  private environment: string;
  private apiBaseUrl: string;

  constructor() {
    // Use production keys if available, otherwise fall back to sandbox
    const isProduction = process.env.NODE_ENV === "production" || 
                         process.env.SQUARE_ENVIRONMENT === "production" ||
                         process.env.VITE_SQUARE_ENVIRONMENT === "production";
    
    this.accessToken = isProduction 
      ? (process.env.SQUARE_ACCESS_TOKEN_PRODUCTION || process.env.SQUARE_ACCESS_TOKEN!)
      : process.env.SQUARE_ACCESS_TOKEN!;
    
    this.environment = isProduction ? "production" : "sandbox";
    this.apiBaseUrl = this.environment === "production" 
      ? "https://connect.squareup.com/v2" 
      : "https://connect.squareupsandbox.com/v2";
    
    console.log(`Square Service initialized in ${this.environment} mode`);
  }

  private async makeRequest(endpoint: string, method: string = "GET", body?: any) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    const headers = {
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const options: any = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      console.error(`Square API Error Details:`, {
        url: url,
        method: method,
        requestBody: body,
        status: response.status,
        statusText: response.statusText,
        errorResponse: error,
        errorDetails: error.errors ? error.errors.map((e: any) => ({ 
          category: e.category, 
          code: e.code, 
          detail: e.detail 
        })) : 'No error details'
      });
      throw new Error(`Square API Error: ${error.message || response.statusText}`);
    }

    return await response.json();
  }

  // Create Square customer for card on file
  async createCustomer(firstName: string, lastName: string, email: string) {
    try {
      const requestBody = {
        given_name: firstName,
        family_name: lastName,
        email_address: email,
      };

      const response = await this.makeRequest("/customers", "POST", requestBody);
      
      if (response.customer) {
        return response.customer;
      } else {
        throw new Error("Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating Square customer:", error);
      throw error;
    }
  }

  // Create and store a card on file for a customer
  async createCardOnFile(customerId: string, cardNonce: string, cardholderName: string) {
    try {
      const requestBody = {
        idempotency_key: randomUUID(),
        source_id: cardNonce,
        card: {
          customer_id: customerId,
          cardholder_name: cardholderName
        }
      };

      const response = await this.makeRequest("/cards", "POST", requestBody);
      
      if (response.card) {
        return {
          id: response.card.id,
          last4: response.card.last_4,
          cardBrand: response.card.card_brand,
          expMonth: response.card.exp_month,
          expYear: response.card.exp_year,
          cardholderName: response.card.cardholder_name || cardholderName,
          customerId: customerId
        };
      } else {
        throw new Error("Failed to create card");
      }
    } catch (error) {
      console.error("Error creating Square card:", error);
      throw error;
    }
  }

  // Charge a stored card on file
  async chargeStoredCard(amount: number, currency: string, cardId: string, customerId: string, description: string) {
    try {
      const requestBody = {
        idempotency_key: randomUUID(),
        amount_money: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency
        },
        source_id: cardId,
        note: description,
        autocomplete: true,
        customer_id: customerId
      };

      const response = await this.makeRequest("/payments", "POST", requestBody);
      
      if (response.payment) {
        return {
          id: response.payment.id,
          status: response.payment.status,
          receiptUrl: response.payment.receipt_url,
          amountMoney: response.payment.amount_money,
          cardDetails: response.payment.card_details,
          customerId: customerId
        };
      } else {
        throw new Error("Payment failed - no payment returned");
      }
    } catch (error) {
      console.error("Square stored card payment failed:", error);
      throw error;
    }
  }

  // Get customer's stored cards
  async getCustomerCards(customerId: string) {
    try {
      const response = await this.makeRequest(`/cards?customer_id=${customerId}`, "GET");
      
      return response.cards?.map((card: any) => ({
        id: card.id,
        last4: card.last_4,
        cardBrand: card.card_brand,
        expMonth: card.exp_month,
        expYear: card.exp_year,
        cardholderName: card.cardholder_name,
        enabled: card.enabled
      })) || [];
    } catch (error) {
      console.error("Error getting customer cards:", error);
      throw error;
    }
  }

  // Disable a stored card (Square doesn't allow deletion)
  async disableCard(cardId: string) {
    try {
      const requestBody = {
        card: {
          enabled: false
        }
      };

      const response = await this.makeRequest(`/cards/${cardId}`, "PUT", requestBody);
      
      if (response.card) {
        return {
          id: response.card.id,
          enabled: response.card.enabled
        };
      } else {
        throw new Error("Failed to disable card");
      }
    } catch (error) {
      console.error("Error disabling card:", error);
      throw error;
    }
  }

  // Legacy payment processing method (for backward compatibility)
  async processPayment(amount: number, currency: string, cardNonce: string, note?: string) {
    try {
      const requestBody = {
        source_id: cardNonce,
        amount_money: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency,
        },
        idempotency_key: randomUUID(),
        autocomplete: true,
        note: note || "Game spin payment",
        accept_partial_authorization: false,
        buyer_email_address: "player@hittheroadjackpot.com",
        billing_address: {
          address_line_1: "123 Main Street",
          locality: "San Francisco",
          administrative_district_level_1: "CA",
          postal_code: "94102",
          country: "US"
        }
      };

      const response = await this.makeRequest("/payments", "POST", requestBody);
      
      if (response.payment) {
        // Extract card details from successful payment
        const cardDetails = response.payment.card_details?.card || {};
        
        return {
          id: response.payment.id,
          status: response.payment.status,
          receiptUrl: response.payment.receipt_url,
          cardDetails: {
            last4: cardDetails.last_4,
            cardBrand: cardDetails.card_brand,
            cardType: cardDetails.card_type
          }
        };
      } else {
        throw new Error("Payment failed - no payment object returned");
      }
    } catch (error: any) {
      // Check if it's a card verification issue
      if (error.message && error.message.includes('CVV_FAILURE')) {
        throw new Error("Card verification failed. Please ensure CVV is correct and try again.");
      } else if (error.message && error.message.includes('GENERIC_DECLINE')) {
        throw new Error("Payment was declined by your bank. Please check your card details or try another card.");
      }
      
      throw new Error("Payment processing failed. Please try again or contact support.");
    }
  }

  // Verify card with small test charge (for card validation)
  async verifyCard(cardNonce: string, customerId?: string) {
    try {
      const requestBody = {
        source_id: cardNonce,
        amount_money: {
          amount: 1, // 1 cent verification
          currency: "USD",
        },
        idempotency_key: randomUUID(),
        autocomplete: true,
        note: "Card verification charge",
        customer_id: customerId
      };

      const response = await this.makeRequest("/payments", "POST", requestBody);
      
      if (response.payment) {
        const cardDetails = response.payment.card_details?.card || {};
        
        return {
          id: response.payment.id,
          status: response.payment.status,
          receiptUrl: response.payment.receipt_url,
          cardDetails: {
            last4: cardDetails.last_4,
            cardBrand: cardDetails.card_brand,
            cardType: cardDetails.card_type
          }
        };
      } else {
        throw new Error("Card verification failed");
      }
    } catch (error) {
      console.error("Error verifying card:", error);
      throw error;
    }
  }
}

export const squareService = new SquareService();