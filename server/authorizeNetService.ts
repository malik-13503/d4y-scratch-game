import { createRequire } from "module";
const require = createRequire(import.meta.url);
const AuthorizeNet = require("authorizenet");
const ApiContracts = AuthorizeNet.APIContracts;
const ApiControllers = AuthorizeNet.APIControllers;
const Constants = AuthorizeNet.Constants;

const API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID!;
const TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY!;

function getMerchantAuth() {
  const auth = new ApiContracts.MerchantAuthenticationType();
  auth.setName(API_LOGIN_ID);
  auth.setTransactionKey(TRANSACTION_KEY);
  return auth;
}

function getEnvironment() {
  return process.env.NODE_ENV === "production"
    ? Constants.endpoint.production
    : Constants.endpoint.sandbox;
}

export interface ChargeResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  errorCode?: string;
}

export async function chargeCreditCard(
  opaqueDataDescriptor: string,
  opaqueDataValue: string,
  amountDollars: number,
  description: string,
  customerEmail?: string
): Promise<ChargeResult> {
  // Sandbox bypass — frontend sends this dummy token when VITE_AUTHORIZE_NET_ENV !== "production"
  if (opaqueDataValue === "SANDBOX_TEST_TOKEN") {
    return {
      success: true,
      transactionId: `SANDBOX-${Date.now()}`,
      message: "Sandbox test payment approved",
    };
  }

  return new Promise((resolve) => {
    const merchantAuth = getMerchantAuth();

    const opaqueData = new ApiContracts.OpaqueDataType();
    opaqueData.setDataDescriptor(opaqueDataDescriptor);
    opaqueData.setDataValue(opaqueDataValue);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setOpaqueData(opaqueData);

    const transactionRequest = new ApiContracts.TransactionRequestType();
    transactionRequest.setTransactionType(
      ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequest.setAmount(amountDollars.toFixed(2));
    transactionRequest.setPayment(paymentType);
    transactionRequest.setDescription(description);

    if (customerEmail) {
      const customer = new ApiContracts.CustomerDataType();
      customer.setEmail(customerEmail);
      transactionRequest.setCustomer(customer);
    }

    const request = new ApiContracts.CreateTransactionRequest();
    request.setMerchantAuthentication(merchantAuth);
    request.setTransactionRequest(transactionRequest);

    const controller = new ApiControllers.CreateTransactionController(
      request.getJSON()
    );
    controller.setEnvironment(getEnvironment());

    controller.execute(() => {
      try {
        const apiResponse = controller.getResponse();
        const response = new ApiContracts.CreateTransactionResponse(apiResponse);

        if (!response) {
          return resolve({ success: false, message: "No response from payment gateway" });
        }

        const resultCode = response.getMessages().getResultCode();

        if (resultCode === ApiContracts.MessageTypeEnum.OK) {
          const txResponse = response.getTransactionResponse();
          if (txResponse && txResponse.getMessages()) {
            resolve({
              success: true,
              transactionId: txResponse.getTransId(),
              message: "Payment successful",
            });
          } else {
            const errors = txResponse?.getErrors();
            resolve({
              success: false,
              errorCode: errors?.getError()?.[0]?.getErrorCode(),
              message: errors?.getError()?.[0]?.getErrorText() || "Transaction declined",
            });
          }
        } else {
          const txResponse = response.getTransactionResponse();
          const txErrors = txResponse?.getErrors();
          const msgErrors = response.getMessages()?.getMessage();
          resolve({
            success: false,
            errorCode:
              txErrors?.getError()?.[0]?.getErrorCode() ||
              msgErrors?.[0]?.getCode(),
            message:
              txErrors?.getError()?.[0]?.getErrorText() ||
              msgErrors?.[0]?.getText() ||
              "Payment failed",
          });
        }
      } catch (err: any) {
        resolve({ success: false, message: err.message || "Payment processing error" });
      }
    });
  });
}
