"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import { formatEther } from "viem";
import {
  useAccount,
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useAuth } from "@/src/client/auth/AuthProvider";
import Link from "next/link";

type BillingPlanInfo = {
  plan: "FREE" | "PRO" | "PRO_PLUS";
  label: string;
  priceWei: string;
  creditsGranted: number;
};

type PlansResponse = {
  chainId: number;
  adminWalletAddress: string;
  plans: BillingPlanInfo[];
};

function shortAddr(addr: string): string {
  if (!addr.startsWith("0x") || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function Pricing() {
  const { token, user, status, refreshUser } = useAuth();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [plansState, setPlansState] = useState<PlansResponse | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  const proPlan = useMemo(() => {
    return plansState?.plans.find((p) => p.plan === "PRO") ?? null;
  }, [plansState]);

  const proPlusPlan = useMemo(() => {
    return plansState?.plans.find((p) => p.plan === "PRO_PLUS") ?? null;
  }, [plansState]);

  const proPriceOg = useMemo(() => {
    if (!proPlan) return null;
    try {
      return formatEther(BigInt(proPlan.priceWei));
    } catch {
      return null;
    }
  }, [proPlan]);

  const proPlusPriceOg = useMemo(() => {
    if (!proPlusPlan) return null;
    try {
      return formatEther(BigInt(proPlusPlan.priceWei));
    } catch {
      return null;
    }
  }, [proPlusPlan]);

  const admin = plansState?.adminWalletAddress ?? null;
  const billingChainId = plansState?.chainId ?? null;

  const {
    data: txHash,
    sendTransactionAsync,
    isPending: isSending,
  } = useSendTransaction();

  const { isLoading: isMining, isSuccess: isMined } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const [confirmStatus, setConfirmStatus] = useState<
    "idle" | "confirming" | "success" | "error"
  >("idle");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [pendingPlan, setPendingPlan] = useState<"PRO" | "PRO_PLUS" | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/billing/plans");
        const data = (await res.json()) as PlansResponse;
        if (!res.ok) throw new Error("Failed to load plans");
        setPlansState(data);
        setPlansError(null);
      } catch (e) {
        setPlansError(e instanceof Error ? e.message : "Failed to load plans");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isMined || !txHash || !token || !pendingPlan) return;

    (async () => {
      try {
        setConfirmStatus("confirming");
        setConfirmMessage("Confirming payment on server…");

        const res = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: pendingPlan, txHash }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: { message?: string };
        };

        if (!res.ok || !data.success) {
          throw new Error(
            data?.error?.message ?? "Payment confirmation failed",
          );
        }

        await refreshUser();
        setConfirmStatus("success");
        setConfirmMessage(
          pendingPlan === "PRO_PLUS"
            ? "Pro+ unlocked. Credits added to your account."
            : "Pro unlocked. Credits added to your account.",
        );
      } catch (e) {
        setConfirmStatus("error");
        setConfirmMessage(
          e instanceof Error ? e.message : "Payment confirmation failed",
        );
      }
    })();
  }, [isMined, pendingPlan, refreshUser, token, txHash]);

  const needsChainSwitch =
    !!billingChainId && currentChainId !== billingChainId;

  const canUpgradePro =
    !!proPlan &&
    !!admin &&
    !!billingChainId &&
    isConnected &&
    status === "authenticated" &&
    !!token &&
    user?.plan !== "PRO" &&
    user?.plan !== "PRO_PLUS" &&
    user?.plan !== "TEAM";

  const canUpgradeProPlus =
    !!proPlusPlan &&
    !!admin &&
    !!billingChainId &&
    isConnected &&
    status === "authenticated" &&
    !!token &&
    user?.plan !== "PRO_PLUS" &&
    user?.plan !== "TEAM";

  const startUpgrade = async (plan: "PRO" | "PRO_PLUS") => {
    if (!admin || !billingChainId) return;
    if (!token) {
      setConfirmStatus("error");
      setConfirmMessage("Please sign in (SIWE) first.");
      return;
    }

    const selected = plan === "PRO_PLUS" ? proPlusPlan : proPlan;
    if (!selected) return;

    try {
      setConfirmStatus("idle");
      setConfirmMessage("");
      setPendingPlan(plan);

      if (needsChainSwitch) {
        await switchChainAsync({ chainId: billingChainId });
      }

      await sendTransactionAsync({
        to: admin as `0x${string}`,
        value: BigInt(selected.priceWei),
      });
    } catch (e) {
      setPendingPlan(null);
      setConfirmStatus("error");
      setConfirmMessage(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  return (
    <section id="pricing" className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[12px] text-purple-300 font-medium">
              Pricing
            </span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Start free. Upgrade when you scale.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every new wallet starts with{" "}
            <span className="text-white font-semibold">100 credits</span>. App
            generation consumes credits.
          </p>
        </div>

        {plansError ? (
          <div className="text-center text-sm text-red-400">{plansError}</div>
        ) : !plansState ? (
          <div className="flex items-center justify-center text-sm text-slate-400 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading plans…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Free</h3>
                  <p className="text-sm text-slate-500">
                    For trying out 0GPilot
                  </p>
                </div>
                {user?.plan === "FREE" && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    Current
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-white">0</div>
                <div className="text-xs text-slate-500">0 0G</div>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                {[
                  "100 starter credits",
                  "Basic AI generation",
                  "Shared AI agents",
                  "Testnet deployments",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-xs text-slate-500">
                {isConnected ? (
                  <div>
                    Balance:{" "}
                    <span className="text-white font-semibold">
                      {user?.credits ?? "—"}
                    </span>{" "}
                    credits
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Connect wallet to start.
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Start Building
                </Link>
              </div>
            </div>

            <div className="bg-[#0B1120] border border-purple-500/30 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.20),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Pro</h3>
                    <p className="text-sm text-slate-500">
                      For frequent generations
                    </p>
                  </div>
                  {user?.plan === "PRO" ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      Popular
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-white">
                    {proPriceOg ?? "—"}{" "}
                    <span className="text-base text-slate-400 font-semibold">
                      0G / month
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Paid as one-time on-chain purchase
                  </div>
                  {admin && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                      Paying to{" "}
                      <span className="text-white font-mono">
                        {shortAddr(admin)}
                      </span>
                      <a
                        href={`https://chainscan-galileo.0g.ai/address/${admin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  {[
                    `${proPlan?.creditsGranted ?? "—"} credits added`,
                    "Lower cost per generation",
                    "Advanced agents",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => startUpgrade("PRO")}
                    disabled={
                      !canUpgradePro ||
                      isSending ||
                      isMining ||
                      confirmStatus === "confirming"
                    }
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    {(isSending ||
                      isMining ||
                      confirmStatus === "confirming") && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {needsChainSwitch
                      ? "Switch Network"
                      : user?.plan === "PRO_PLUS"
                      ? "Included in Pro+"
                      : user?.plan === "PRO"
                      ? "Pro Active"
                      : "Unlock Advanced Agents"}
                  </button>

                  {!isConnected && (
                    <div className="mt-3 text-xs text-slate-500 text-center">
                      Connect your wallet to continue.
                    </div>
                  )}

                  {status === "authenticating" && (
                    <div className="mt-3 text-xs text-slate-500 text-center">
                      Waiting for wallet signature…
                    </div>
                  )}

                  {confirmMessage && (
                    <div
                      className={`mt-3 text-xs text-center ${
                        confirmStatus === "success"
                          ? "text-emerald-400"
                          : confirmStatus === "error"
                          ? "text-red-400"
                          : "text-blue-400"
                      }`}
                    >
                      {confirmMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.18),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Pro+</h3>
                    <p className="text-sm text-slate-500">
                      Serious autonomous workflows
                    </p>
                  </div>
                  {user?.plan === "PRO_PLUS" ? (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      Premium
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-3xl font-bold text-white">
                    {proPlusPriceOg ?? "—"}{" "}
                    <span className="text-base text-slate-400 font-semibold">
                      0G / month
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Paid as one-time on-chain purchase
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  {[
                    `${proPlusPlan?.creditsGranted ?? "—"} credits added`,
                    "Autonomous mode",
                    "Infrastructure-grade workflows",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => startUpgrade("PRO_PLUS")}
                    disabled={
                      !canUpgradeProPlus ||
                      isSending ||
                      isMining ||
                      confirmStatus === "confirming"
                    }
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    {(isSending ||
                      isMining ||
                      confirmStatus === "confirming") && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {needsChainSwitch
                      ? "Switch Network"
                      : user?.plan === "PRO_PLUS"
                      ? "Pro+ Active"
                      : "Activate Autonomous Mode"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Team</h3>
                  <p className="text-sm text-slate-500">Custom pricing</p>
                </div>
                {user?.plan === "TEAM" && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-white">Custom</div>
                <div className="text-xs text-slate-500">Contact sales</div>
              </div>

              <div className="space-y-3 text-sm text-slate-300">
                {[
                  "Dedicated support",
                  "Custom credit limits",
                  "Enterprise workflows",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a
                  href="https://github.com/vmmuthu31/0gPilot/issues/new?title=Team%20plan%20inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
