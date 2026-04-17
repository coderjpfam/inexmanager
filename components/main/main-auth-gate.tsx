"use client";

import { clearAuthToken, getAuthToken } from "@/lib/auth-token";
import { validateToken } from "@/store/auth/auth.thunk";
import { useAppDispatch } from "@/store/hooks";
import { store } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function MainAuthGate({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = getAuthToken();
      if (!stored) {
        router.replace("/signin");
        return;
      }

      const { auth } = store.getState();
      if (auth.token === stored && auth.user) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        await dispatch(validateToken({ token: stored })).unwrap();
      } catch {
        clearAuthToken();
        router.replace("/signin");
        return;
      }

      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[#64748B] dark:text-[#8892B0]">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
