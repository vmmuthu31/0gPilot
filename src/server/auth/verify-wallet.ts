import "server-only";
import { SiweMessage } from "siwe";

export interface VerifyWalletInput {
  message: string;
  signature: string;
  nonce: string;
}

export interface VerifyWalletResult {
  success: boolean;
  address?: string;
  error?: string;
}

export async function verifyWalletSignature(
  input: VerifyWalletInput
): Promise<VerifyWalletResult> {
  try {
    const siweMessage = new SiweMessage(input.message);

    const { data, error } = await siweMessage.verify({
      signature: input.signature,
      nonce: input.nonce,
    });

    if (error) {
      return { success: false, error: error.type };
    }

    return { success: true, address: data.address.toLowerCase() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    return { success: false, error: message };
  }
}
