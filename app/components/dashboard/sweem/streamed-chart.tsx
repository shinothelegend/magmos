"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// Mock streamed-volume series (placeholder data) for the dashboard analytics card.
const data = [
  { month: "Jan", streamed: 1200 },
  { month: "Feb", streamed: 2100 },
  { month: "Mar", streamed: 1650 },
  { month: "Apr", streamed: 2980 },
  { month: "May", streamed: 2400 },
  { month: "Jun", streamed: 3720 },
  { month: "Jul", streamed: 3280 },
];

const chartConfig = {
  streamed: { label: "Streamed", color: "#2563eb" },
} satisfies ChartConfig;

const chartMargin = { left: 4, right: 8, top: 8, bottom: 0 };

type ChartType = "area" | "line" | "bar";

const chartTypes: { key: ChartType; label: string }[] = [
  { key: "area", label: "Area" },
  { key: "line", label: "Line" },
  { key: "bar", label: "Bar" },
];

const axis = (
  <>
    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eef2f7" />
    <XAxis
      dataKey="month"
      tickLine={false}
      axisLine={false}
      tickMargin={10}
      fontSize={12}
    />
    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
  </>
);

export function StreamedChart() {
  const [type, setType] = useState<ChartType>("area");

  return (
    <div>
      <div className="dashboard-chart-toolbar mb-2 justify-end">
        {chartTypes.map((t) => (
          <button
            className={[
              "dashboard-chart-tab dashboard-chart-tab-custom",
              type === t.key ? "dashboard-chart-tab-active" : "",
            ].join(" ")}
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        {type === "area" ? (
          <AreaChart data={data} margin={chartMargin}>
            <defs>
              <linearGradient id="fillStreamed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-streamed)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-streamed)" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            {axis}
            <Area
              dataKey="streamed"
              type="natural"
              stroke="var(--color-streamed)"
              strokeWidth={2}
              fill="url(#fillStreamed)"
            />
          </AreaChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={chartMargin}>
            {axis}
            <Line
              dataKey="streamed"
              type="natural"
              stroke="var(--color-streamed)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={chartMargin}>
            {axis}
            <Bar dataKey="streamed" fill="var(--color-streamed)" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ChartContainer>
    </div>
  );
}
