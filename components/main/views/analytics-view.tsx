"use client";

import { useFinance } from "@/components/main/finance-provider";
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
import { useEffect, useMemo, useState } from "react";
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

export function AnalyticsView() {
  const { categories, expenseByCategory } = useFinance();

  const muted = "rgb(100, 116, 139)";
  const mutedDark = "rgb(136, 146, 176)";
  const grid = "rgb(226, 232, 240)";
  const gridDark = "rgb(45, 49, 73)";

  const [isDark, setIsDark] = useState(false);

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

  const barData = useMemo(
    () => ({
      labels: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
      datasets: [
        {
          label: "Income",
          data: [72000, 85000, 91000, 78000, 88000, 97000],
          backgroundColor: "#00C896",
          borderRadius: 6,
        },
        {
          label: "Expenses",
          data: [48000, 52000, 61000, 43000, 55000, 30200],
          backgroundColor: "#FF6B6B",
          borderRadius: 6,
        },
      ],
    }),
    [],
  );

  const donutData = useMemo(() => {
    const expCats = categories.filter((c) => c.type === "expense");
    const labels = expCats.map((c) => c.name);
    const data = expCats.map((c) => expenseByCategory(c.name));
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#00C896",
            "#FF6B6B",
            "#6C63FF",
            "#F59E0B",
            "#3B82F6",
            "#EC4899",
            "#10B981",
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [categories, expenseByCategory]);

  const lineData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Net Savings",
          data: [24000, 35000, 30000, 66800, null, null, null, null, null, null, null, null],
          borderColor: "#00C896",
          backgroundColor: "rgba(0,200,150,0.1)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#00C896",
          spanGaps: false,
        },
      ],
    }),
    [],
  );

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

  return (
    <div className="main-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <h3 className="mb-4 text-sm font-semibold">Income vs Expenses</h3>
          <div className="h-[220px]">
            <Bar data={barData} options={baseOpts as never} />
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
          <h3 className="mb-4 text-sm font-semibold">Spending by Category</h3>
          <div className="h-[220px]">
            <Doughnut data={donutData} options={donutOpts} />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 dark:border-[#2D3149] dark:bg-[#1A1D27]">
        <h3 className="mb-4 text-sm font-semibold">Monthly Trend</h3>
        <div className="h-[280px]">
          <Line data={lineData} options={lineOpts as never} />
        </div>
      </div>
    </div>
  );
}
