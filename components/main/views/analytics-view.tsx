"use client";

import { shortMonthLabel } from "@/lib/analytics/months";
import { fetchAnalyticsBundle } from "@/store/analytics/analytics.thunk";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
);

const DONUT_COLORS = [
  "#00C896",
  "#FF6B6B",
  "#6C63FF",
  "#F59E0B",
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#94A3B8",
];

export function AnalyticsView() {
  const dispatch = useAppDispatch();
  const { bundle, status, error } = useAppSelector((s) => s.analytics);

  const muted = "rgb(100, 116, 139)";
  const mutedDark = "rgb(136, 146, 176)";
  const grid = "rgb(226, 232, 240)";
  const gridDark = "rgb(45, 49, 73)";

  const [isDark, setIsDark] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchAnalyticsBundle());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function sync() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      obs.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  const textColor = isDark ? mutedDark : muted;
  const gridColor = isDark ? gridDark : grid;

  const barData = useMemo(() => {
    if (!bundle?.monthly?.length) {
      return { labels: [] as string[], datasets: [] as never[] };
    }
    const labels = bundle.monthly.map((r) => shortMonthLabel(r.month));
    return {
      labels,
      datasets: [
        {
          label: "Income",
          data: bundle.monthly.map((r) => r.income),
          backgroundColor: "#00C896",
          borderRadius: 6,
        },
        {
          label: "Expenses",
          data: bundle.monthly.map((r) => r.expense),
          backgroundColor: "#FF6B6B",
          borderRadius: 6,
        },
      ],
    };
  }, [bundle]);

  const donutData = useMemo(() => {
    const rows = bundle?.byCategory?.data ?? [];
    if (!rows.length) {
      return { labels: [] as string[], datasets: [] as never[] };
    }
    return {
      labels: rows.map((r) => r.categoryName),
      datasets: [
        {
          data: rows.map((r) => r.totalAmount),
          backgroundColor: rows.map((_, i) => DONUT_COLORS[i % DONUT_COLORS.length]),
          borderWidth: 0,
        },
      ],
    };
  }, [bundle]);

  const lineData = useMemo(() => {
    if (!bundle?.netWorth?.length) {
      return { labels: [] as string[], datasets: [] as never[] };
    }
    const labels = bundle.netWorth.map((r) => shortMonthLabel(r.month));
    return {
      labels,
      datasets: [
        {
          label: "Net worth",
          data: bundle.netWorth.map((r) => r.netWorth),
          borderColor: "#00C896",
          backgroundColor: "rgba(0,200,150,0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#00C896",
          spanGaps: false,
        },
      ],
    };
  }, [bundle]);

  const baseOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: { family: "inherit", size: 11 },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: textColor,
            callback: (v: string | number) => `₹${Number(v) / 1000}k`,
          },
          grid: { color: gridColor },
        },
      },
    }),
    [textColor, gridColor],
  );

  const lineOpts = useMemo(
    () => ({
      ...baseOpts,
      scales: {
        ...baseOpts.scales,
        y: {
          ...baseOpts.scales.y,
          ticks: {
            ...baseOpts.scales.y.ticks,
            callback: (v: string | number) => `₹${Number(v) / 1000}k`,
          },
        },
      },
    }),
    [baseOpts],
  );

  const donutOpts = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: textColor, font: { size: 11 } },
        },
      },
      cutout: "65%",
    }),
    [textColor],
  );

  if (status === "loading" || status === "idle") {
    return (
      <div className="main-fade-up space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[220px] animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#2D3149]" />
          <div className="h-[220px] animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#2D3149]" />
        </div>
        <div className="h-[280px] animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#2D3149]" />
      </div>
    );
  }

  if (status === "failed" || !bundle) {
    return (
      <div className="main-fade-up rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <p className="text-sm text-[#64748B] dark:text-[#8892B0]">{error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-xl bg-[#00C896] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00A87C]"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasBar = bundle.monthly.length > 0;
  const hasDonut = bundle.byCategory.data.length > 0;
  const hasLine = bundle.netWorth.length > 0;

  return (
    <div className="main-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <h3 className="mb-4 text-sm font-semibold">Income vs Expenses</h3>
          <div className="h-[220px]">
            {hasBar ? (
              <Bar data={barData as never} options={baseOpts as never} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No monthly data yet
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <h3 className="mb-4 text-sm font-semibold">
            Spending by category · {bundle.byCategory.type === "expense" ? "Expense" : "Income"}
          </h3>
          <div className="h-[220px]">
            {hasDonut ? (
              <Doughnut data={donutData as never} options={donutOpts} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#64748B] dark:text-[#8892B0]">
                No category breakdown for this month
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <h3 className="mb-4 text-sm font-semibold">Net worth trend</h3>
        <div className="h-[280px]">
          {hasLine ? (
            <Line data={lineData as never} options={lineOpts as never} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#64748B] dark:text-[#8892B0]">
              No net worth history yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
