const filters = ["D", "W", "M", "Q", "Custom"] as const;

export function ChartToolbar() {
  return (
    <div aria-label="Chart range" className="dashboard-chart-toolbar">
      {filters.map((filter) => (
        <button
          className={[
            "dashboard-chart-tab",
            filter === "D" ? "dashboard-chart-tab-active" : "",
            filter === "Custom" ? "dashboard-chart-tab-custom" : "",
          ].join(" ")}
          key={filter}
          type="button"
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
