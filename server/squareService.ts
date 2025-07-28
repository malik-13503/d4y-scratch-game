import { randomUUID } from "crypto";

// Simple Square service implementation using direct API calls
export class SquareService {
  private accessToken: string;
  private environment: string;
  private apiBaseUrl: string;

  constructor() {
    // Use production keys if available, otherwise fall back to sandbox
    const isProduction = process.env.NODE_ENV === "production" || process.env.SQUARE_ENVIRONMENT === "production";
    
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
      // Create a $0.01 verification charge that will be immediately refunded
      const requestBody = {
        source_id: cardNonce,
        amount_money: {
          amount: 1, // $0.01 in cents
          currency: "USD",
        },
        idempotency_key: randomUUID(),
        autocomplete: true,
        note: "Card verification - will be refunded",
      };

      const response = await this.makeRequest("/payments", "POST", requestBody);
      
      if (response.payment) {
        // Immediately refund the verification charge
        const refundResponse = await this.makeRequest(`/payments/${response.payment.id}/refunds`, "POST", {
          idempotency_key: randomUUID(),
          amount_money: {
            amount: 1,
            currency: "USD",
          },
          reason: "Card verification refund",
        });
        
        return {
          verified: true,
          payment: response.payment,
          refund: refundResponse.refund,
        };
      } else {
        return { verified: false };
      }
    } catch (error) {
      console.error("Error verifying card:", error);
      return { verified: false, error: error };
    }
  }

  isApiError(error: any): boolean {
    return error?.name === 'ApiError' || error?.constructor?.name === 'ApiError';
  }
}

export const squareService = new SquareService();