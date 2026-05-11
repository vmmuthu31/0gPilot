import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";

import { ethers } from "ethers";

const RPC_URL =
  process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";

const INDEXER_RPC =
  process.env.NEXT_PUBLIC_0G_INDEXER_RPC ||
  "https://indexer-storage-testnet-turbo.0g.ai";

const PRIVATE_KEY = process.env.ZERO_G_PRIVATE_KEY || "";

const provider = new ethers.JsonRpcProvider(RPC_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const indexer = new Indexer(INDEXER_RPC);

export interface UploadResponse {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
}

export interface GenerateCodePayload {
  prompt: string;
  projectId: string;
  agent: string;
  output: string;
}

class ZeroGStorageService {
  async uploadJSON(data: Record<string, unknown>): Promise<UploadResponse> {
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(data, null, 2));

      const memData = new MemData(encoded);

      const [tree, treeErr] = await memData.merkleTree();

      if (treeErr) {
        return {
          success: false,
          error: treeErr.toString(),
        };
      }

      console.log("Merkle Root:", tree?.rootHash());

      const [tx, uploadErr] = await indexer.upload(memData, RPC_URL, signer);

      if (uploadErr) {
        return {
          success: false,
          error: uploadErr.toString(),
        };
      }

      if ("rootHash" in tx) {
        return {
          success: true,
          rootHash: tx.rootHash,
          txHash: tx.txHash,
        };
      }

      return {
        success: true,
        rootHash: tx.rootHashes[0],
        txHash: tx.txHashes[0],
      };
    } catch (error: unknown) {
      console.error(error);

      const message = error instanceof Error ? error.message : "Upload failed";

      return {
        success: false,
        error: message,
      };
    }
  }

  async storeMemory(payload: GenerateCodePayload) {
    return this.uploadJSON({
      type: "ai-memory",
      timestamp: Date.now(),
      ...payload,
    });
  }

  async storeFrontendCode(projectId: string, files: Record<string, unknown>) {
    return this.uploadJSON({
      type: "frontend",
      projectId,
      files,
      createdAt: Date.now(),
    });
  }

  async storeContract(projectId: string, contractCode: string) {
    return this.uploadJSON({
      type: "smart-contract",
      projectId,
      contractCode,
      createdAt: Date.now(),
    });
  }

  async storeDeployment(
    projectId: string,
    contractAddress: string,
    txHash: string,
  ) {
    return this.uploadJSON({
      type: "deployment",
      projectId,
      contractAddress,
      txHash,
      deployedAt: Date.now(),
    });
  }

  async downloadFile(rootHash: string) {
    try {
      const [blob, err] = await indexer.downloadToBlob(rootHash, {
        proof: true,
      });

      if (err) {
        throw new Error(err.toString());
      }

      const text = await blob.text();

      return JSON.parse(text);
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  async uploadEncryptedJSON(
    data: Record<string, unknown>,
    encryptionKey: Uint8Array,
  ) {
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(data, null, 2));

      const memData = new MemData(encoded);

      const [tree] = await memData.merkleTree();

      console.log("Encrypted Root:", tree?.rootHash());

      const [tx, err] = await indexer.upload(memData, RPC_URL, signer, {
        encryption: {
          type: "aes256",
          key: encryptionKey,
        },
      });

      if (err) {
        throw new Error(err.toString());
      }

      return tx;
    } catch (error) {
      console.error(error);

      return null;
    }
  }
}

export const zeroGStorageService = new ZeroGStorageService();
