"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { walletAddressesMatch } from "@/lib/auth/wallet-address";
import {
  authWallet,
  enablePublicProfile,
  fetchMe,
  type MeData,
} from "@/lib/api/client";

type UserContextValue = {
  me: MeData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  enablePublic: () => Promise<string | null>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const account = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [me, setMe] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMe();
      setMe(data);
    } catch (err) {
      setMe(null);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore session when no wallet is connected (wallet effect handles auth otherwise)
  useEffect(() => {
    if (account?.address) return;
    void refresh();
  }, [refresh, account?.address]);

  useEffect(() => {
    if (!account?.address) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const existing = await fetchMe();
        if (
          existing?.walletAddress &&
          walletAddressesMatch(existing.walletAddress, account.address)
        ) {
          if (!cancelled) {
            setMe(existing);
            setError(null);
          }
          return;
        }

        const data = await authWallet(account.address, async (message) => {
          const result = await signPersonalMessage({
            message: new TextEncoder().encode(message),
          });
          return result.signature;
        });
        if (!cancelled) {
          setMe(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setMe(null);
          setError(err instanceof Error ? err.message : "Wallet auth failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [account?.address, signPersonalMessage]);

  const enablePublic = useCallback(async () => {
    const result = await enablePublicProfile();
    setMe(result.me);
    return result.slug;
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/me", { method: "DELETE", credentials: "include" });
    disconnectWallet();
    setMe(null);
  }, [disconnectWallet]);

  const value = useMemo(
    () => ({
      me,
      loading,
      error,
      refresh,
      enablePublic,
      signOut,
    }),
    [me, loading, error, refresh, enablePublic, signOut],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
