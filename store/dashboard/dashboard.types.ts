import type { DashboardPayload } from "@/lib/analytics/build-dashboard";

export type { DashboardPayload };

export type DashboardSliceState = {
  data: DashboardPayload | null;
  month: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};
