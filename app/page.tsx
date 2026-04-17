"use client";

import { clearAuthToken, getAuthToken } from "@/lib/auth-token";
import { validateToken } from "@/store/auth/auth.thunk";
import { useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getAuthToken();
      if (!token) {
        router.replace("/signin");
        return;
      }

      try {
        await dispatch(validateToken({ token })).unwrap();
        if (!cancelled) router.replace("/dashboard");
      } catch {
        clearAuthToken();
        if (!cancelled) router.replace("/signin");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-black dark:text-zinc-400">
      <p>Checking session…</p>
    </div>
  );
}
