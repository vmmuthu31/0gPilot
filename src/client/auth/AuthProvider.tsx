"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SiweMessage } from "siwe";
import { useAccount, useChainId, useSignMessage } from "wagmi";
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from "@/src/client/auth/auth";

export type AuthUser = {
  id: string;
  address: string;
  plan: "FREE" | "PRO" | "PRO_PLUS" | "TEAM";
  credits: number;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  status: "idle" | "authenticating" | "authenticated" | "error";
  error: string | null;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchNonce(address: string): Promise<string> {
  const res = await fetch(`/api/auth/nonce?address=${address}`);
  const data = (await res.json()) as { nonce?: string; error?: unknown };
  if (!res.ok || !data.nonce) {
    throw new Error("Failed to fetch nonce");
  }
  return data.nonce;
}

async function verifySiwe(payload: {
  message: string;
  signature: string;
  address: string;
}): Promise<{ token: string }> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as { token?: string; error?: unknown };
  if (!res.ok || !data.token) {
    throw new Error("SIWE verification failed");
  }
  return { token: data.token };
}

async function fetchSession(token: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/session", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as {
    user?: {
      id: string;
      address: string;
      plan?: "FREE" | "PRO" | "PRO_PLUS" | "TEAM";
      credits?: number;
    };
    error?: unknown;
  };

  if (
    !res.ok ||
    !data.user ||
    !data.user.plan ||
    typeof data.user.credits !== "number"
  ) {
    throw new Error("Failed to fetch session");
  }

  return {
    id: data.user.id,
    address: data.user.address,
    plan: data.user.plan,
    credits: data.user.credits,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [token, setToken] = useState<string | null>(() => getStoredAuthToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("idle");
  const [error, setError] = useState<string | null>(null);

  const authInFlightRef = useRef(false);
  const hasStoredTokenRef = useRef(token !== null);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const sessionUser = await fetchSession(token);
    setUser(sessionUser);
  }, [token]);

  useEffect(() => {
    if (!isConnected || !address) {
      authInFlightRef.current = false;
      if (!hasStoredTokenRef.current) {
        clearStoredAuthToken();
        queueMicrotask(() => {
          setToken(null);
          setUser(null);
          setStatus("idle");
          setError(null);
        });
      }
      return;
    }

    if (token) {
      hasStoredTokenRef.current = true;
      return;
    }

    if (authInFlightRef.current) return;

    authInFlightRef.current = true;
    setStatus("authenticating");
    setError(null);

    (async () => {
      try {
        const nonce = await fetchNonce(address);

        const siwe = new SiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to 0GPilot",
          uri: window.location.origin,
          version: "1",
          chainId,
          nonce,
        });

        const message = siwe.prepareMessage();
        const signature = await signMessageAsync({ message });

        const verified = await verifySiwe({ message, signature, address });
        setStoredAuthToken(verified.token);
        setToken(verified.token);

        const sessionUser = await fetchSession(verified.token);
        setUser(sessionUser);
        setStatus("authenticated");
      } catch (e) {
        clearStoredAuthToken();
        setToken(null);
        setUser(null);
        setStatus("error");
        setError(e instanceof Error ? e.message : "Authentication failed");
      } finally {
        authInFlightRef.current = false;
      }
    })();
  }, [address, chainId, isConnected, signMessageAsync, token]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setStatus("authenticated");
        setError(null);
        const sessionUser = await fetchSession(token);
        setUser(sessionUser);
      } catch {
        clearStoredAuthToken();
        queueMicrotask(() => {
          setToken(null);
          setUser(null);
          setStatus("idle");
        });
      }
    })();
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      status,
      error,
      refreshUser: async () => {
        try {
          await refreshUser();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Failed to refresh session",
          );
        }
      },
    }),
    [error, refreshUser, status, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
