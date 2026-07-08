import type { ReactNode } from "react";

export type Metric = { label: string; value: ReactNode };

const defaultMetrics: Metric[] = [
  { label: "Gross Volume", value: "$0" },
  { label: "No. of Payments", value: "0" },
];

export function MetricsOverview({ metrics = defaultMetrics }: { metrics?: Metric[] }) {
  return (
    <div className="dashboard-metrics">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <div className="dashboard-metric-label">{metric.label}</div>
          <div className="dashboard-metric-value">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
