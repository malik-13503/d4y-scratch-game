import { randomUUID } from "crypto";

// Simple Square service implementation using direct API calls
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

  async createCard(customerId: string, sourceId: string, cardNonce: string) {
    try {
      const requestBody = {
        source_id: sourceId,
        idempotency_key: randomUUID(),
        card: {
          customer_id: customerId,
          card_nonce: cardNonce,
        },
      };

      const response = await this.makeRequest("/cards", "POST", requestBody);
      
      if (response.card) {
        return response.card;
      } else {
        throw new Error("Failed to create card");
      }
    } catch (error) {
      console.error("Error creating Square card:", error);
      throw error;
    }
  }

  async chargeCard(amount: number, currency: string = "USD", sourceId: string, customerId?: string) {
    try {
      const requestBody = {
        source_id: sourceId,
        amount_money: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency,
        },
        idempotency_key: randomUUID(),
        autocomplete: true,
        customer_id: customerId,
        note: "Hit the Road Jackpot - Game Spin",
      };

      const response = await this.makeRequest("/payments", "POST", requestBody);
      
      if (response.payment) {
        return response.payment;
      } else {
        throw new Error("Payment failed");
      }
    } catch (error) {
      console.error("Error processing Square payment:", error);
      throw error;
    }
  }

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
      console.error("Error processing Square payment with nonce:", error);
      
      // Check if it's a card verification issue
      if (error.message && error.message.includes('CVV_FAILURE')) {
        throw new Error("Card verification failed. Please ensure CVV is correct and try again.");
      } else if (error.message && error.message.includes('GENERIC_DECLINE')) {
        throw new Error("Payment was declined by your bank. Please check your card details or try another card.");
      }
      
      throw new Error("Payment processing failed. Please try again or contact support.");
    }
  }

  async getCustomerCards(customerId: string) {
    try {
      const response = await this.makeRequest(`/cards?customer_id=${customerId}`, "GET");
      
      return response.cards || [];
    } catch (error) {
      console.error("Error getting customer cards:", error);
      throw error;
    }
  }

  async verifyCard(cardNonce: string) {
    try {
      // Instead of processing a payment, we'll verify the card by attempting to create a card on file
      // This is safer and doesn't trigger payment delays
      const tempCustomer = await this.createTempCustomer();
      
      const cardRequestBody = {
        source_id: cardNonce,
        idempotency_key: randomUUID(),
        card: {
          cardholder_name: "Verification Test"
        }
      };

      const response = await this.makeRequest(`/customers/${tempCustomer.id}/cards`, "POST", cardRequestBody);
      
      if (response.card) {
        // Clean up the temporary customer
        await this.makeRequest(`/customers/${tempCustomer.id}`, "DELETE");
        
        return {
          verified: true,
          card: response.card,
        };
      } else {
        return { verified: false };
      }
    } catch (error) {
      console.error("Error verifying card:", error);
      return { verified: false, error: error };
    }
  }

  async createTempCustomer() {
    const requestBody = {
      given_name: "Temp",
      family_name: "Verification",
      email_address: `temp-${randomUUID()}@verification.test`,
    };

    const response = await this.makeRequest("/customers", "POST", requestBody);
    
    if (response.customer) {
      return response.customer;
    } else {
      throw new Error("Failed to create temporary customer");
    }
  }

  isApiError(error: any): boolean {
    return error?.name === 'ApiError' || error?.constructor?.name === 'ApiError';
  }
}

export const squareService = new SquareService();