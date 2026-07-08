import { ReferralCard } from "@/components/referral-card";
import { ChartToolbar } from "./chart-toolbar";
import { MetricsOverview, type Metric } from "./metrics-overview";
import { StreamedChart } from "./sweem/streamed-chart";

export function AnalyticsSection({
  metrics,
}: {
  metrics?: Metric[];
  volumeTitle?: string;
  volumeRows?: [string, string][];
  volumeNote?: string;
} = {}) {
  return (
    <section className="dashboard-analytics" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="sr-only">
        Analytics
      </h2>
      <div className="dashboard-analytics-main">
        <div className="dashboard-analytics-head">
          <MetricsOverview metrics={metrics} />
          <ChartToolbar />
        </div>
        <StreamedChart />
      </div>
      <ReferralCard className="h-full w-full" />
    </section>
  );
}
