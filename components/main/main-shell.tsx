"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AddTransactionModal } from "@/components/main/add-transaction-modal";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/analytics": "Analytics & Reports",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budgets": "Budget Planning",
  "/savings": "Saving Goals",
  "/lending": "Lending & Borrowing",
  "/categories": "Category Management",
};

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
    </svg>
  );
}

function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function IconArrows({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
}

function IconCredit({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function IconBudget({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconSavings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function IconLending({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

const NAV = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", Icon: IconDashboard },
      { href: "/analytics", label: "Analytics", Icon: IconAnalytics },
    ],
  },
  {
    section: "Money",
    items: [
      { href: "/transactions", label: "Transactions", Icon: IconArrows },
      { href: "/accounts", label: "Accounts", Icon: IconCredit },
      { href: "/budgets", label: "Budgets", Icon: IconBudget },
      { href: "/savings", label: "Savings", Icon: IconSavings },
      { href: "/lending", label: "Lending", Icon: IconLending },
    ],
  },
  {
    section: "Manage",
    items: [{ href: "/categories", label: "Categories", Icon: IconTag }],
  },
];

export function MainShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);

  const title = useMemo(
    () => PAGE_TITLES[pathname] ?? "FinTrack",
    [pathname],
  );

  const closeSidebar = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="main-app flex h-screen overflow-hidden bg-[#F0F4F8] text-gray-800 dark:bg-[#0F1117] dark:text-gray-100">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed z-40 flex h-screen w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white transition-transform duration-300 dark:border-[#2D3149] dark:bg-[#1A1D27] lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-[#E2E8F0] p-5 dark:border-[#2D3149]">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={closeSidebar}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00C896]">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                FinTrack
              </div>
              <div className="text-[10px] font-medium text-[#64748B] dark:text-[#8892B0]">
                Smart Finance
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B] dark:text-[#8892B0]">
                {group.section}
              </div>
              {group.items.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeSidebar}
                    className={`main-nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 ${
                      active ? "main-nav-item-active" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E2E8F0] p-4 dark:border-[#2D3149]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00C896] to-[#00A87C] text-xs font-bold text-white">
              AK
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">Alex Kumar</div>
              <div className="text-[10px] text-[#64748B] dark:text-[#8892B0]">
                Personal Account
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#E2E8F0] bg-[#F0F4F8]/80 px-4 py-3 backdrop-blur-md dark:border-[#2D3149] dark:bg-[#0F1117]/80 lg:px-6">
          <button
            type="button"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border-0 bg-transparent text-[#94A3B8] hover:bg-black/[0.06] hover:text-[#1E293B] lg:hidden dark:hover:bg-white/[0.07] dark:hover:text-[#E2E8F0]"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          <button
            type="button"
            onClick={() => setAddTxOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-[#00C896] bg-[#00C896] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#00A87C]"
          >
            <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add</span>
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>

      <AddTransactionModal open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  );
}
