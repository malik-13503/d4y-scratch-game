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
        errorResponse: error
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