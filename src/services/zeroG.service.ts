
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import crypto from "crypto";
import { env } from "@/server/config/env";

import {
  PromptVersionManifestSchema,
  GeneratedFileManifestSchema,
  AuditReportManifestSchema,
  DeploymentManifestSchema,
  WorkflowMemoryManifestSchema,
} from "@/shared/schemas/storage";

const RPC_URL = env.NEXT_PUBLIC_0G_RPC_URL;
const INDEXER_RPC = env.NEXT_PUBLIC_0G_INDEXER_RPC;
const PRIVATE_KEY = env.ZERO_G_PRIVATE_KEY;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer = new Indexer(INDEXER_RPC);

const ENCRYPTION_KEY = crypto.scryptSync(
  env.STORAGE_ENCRYPTION_KEY,
  "0gpilot-salt",
  32,
);

export interface UploadResponse {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
}

class ZeroGStorageService {
  async uploadJSON(
    data: Record<string, unknown>,
    encrypt = false,
  ): Promise<UploadResponse> {
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

      console.log(
        `${encrypt ? "Encrypted " : ""}Merkle Root:`,
        tree?.rootHash(),
      );

      const options = encrypt
        ? {
            encryption: {
              type: "aes256" as const,
              key: ENCRYPTION_KEY,
            },
          }
        : undefined;

      const [tx, uploadErr] = await indexer.upload(
        memData,
        RPC_URL,
        signer,
        options,
      );

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

  async storeWorkflowMemory(payload: unknown, encrypt = true) {
    const data = WorkflowMemoryManifestSchema.parse(payload);
    return this.uploadJSON(data as Record<string, unknown>, encrypt);
  }

  async storePromptVersion(payload: unknown, encrypt = false) {
    const data = PromptVersionManifestSchema.parse(payload);
    return this.uploadJSON(data, encrypt);
  }

  async storeGeneratedFiles(payload: unknown, encrypt = false) {
    const data = GeneratedFileManifestSchema.parse(payload);
    return this.uploadJSON(data, encrypt);
  }

  async storeAuditReport(payload: unknown) {
    const data = AuditReportManifestSchema.parse(payload);
    return this.uploadJSON(data);
  }

  async storeDeployment(payload: unknown) {
    const data = DeploymentManifestSchema.parse(payload);
    return this.uploadJSON(data);
  }

  async downloadFile(rootHash: string, decrypt = false) {
    try {
      const options: {
        proof: boolean;
        encryption?: { type: "aes256"; key: Uint8Array };
      } = { proof: true };

      if (decrypt) {
        options.encryption = { type: "aes256", key: ENCRYPTION_KEY };
      }

      const [blob, err] = await indexer.downloadToBlob(rootHash, options);

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
