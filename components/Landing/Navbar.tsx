import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";

const Navbar = () => (
  <motion.nav
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer">
        <Image
          src="/logo.png"
          alt="0GPilot Logo"
          width={32}
          height={32}
          className="h-8 rounded-full"
          style={{ width: "auto" }}
        />
        <span className="text-xl font-bold tracking-tight text-white">
          OGPilot
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
        {[
          "Features",
          "How it Works",
          "Use Cases",
          "Architecture",
          "Pricing",
        ].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
            className="hover:text-white transition-colors"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="https://github.com/vmmuthu31/0gPilot"
          target="_blank"
          className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors mr-4"
        >
          <Button
            variant="secondary"
            size="sm"
            className="hidden cursor-pointer sm:flex items-center gap-2 rounded-xl px-4 text-white/80 hover:text-white"
          >
            <FaGithub className="w-4 h-4" />
            Star on GitHub
          </Button>
        </Link>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button
                        onClick={openConnectModal}
                        className="px-4 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-all font-bold border-0 shadow-[0_0_15px_rgba(124,58,237,0.3)] h-9"
                      >
                        Connect Wallet
                      </Button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <Button
                        onClick={openChainModal}
                        variant="destructive"
                        size="sm"
                        className="h-9 px-4 text-xs font-bold rounded-lg"
                      >
                        Wrong Network
                      </Button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all h-9"
                        type="button"
                      >
                        {chain.hasIcon && (
                          <div className="w-4 h-4 rounded-full overflow-hidden">
                            {chain.iconUrl && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider hidden md:block">
                          {chain.name}
                        </span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all h-9"
                        type="button"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        <span className="text-xs font-bold text-white font-mono">
                          {account.displayName}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  </motion.nav>
);

export default Navbar;
