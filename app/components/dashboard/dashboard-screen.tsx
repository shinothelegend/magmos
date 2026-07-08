import { Icon } from "./icons";

type ActionKind = "primary" | "secondary";

type Action = {
  label: string;
  kind?: ActionKind;
  icon?: "plus" | "refresh" | "upload";
};

type Stat = {
  label: string;
  value: string;
  active?: boolean;
};

export type ColumnDef = {
  label: string;
  /** When set, renders the matching icon inline with the column header label. */
  icon?: "settings";
};

// ── Action icon helper ────────────────────────────────────────────────────────

function ActionIcon({ icon }: { icon: Action["icon"] }) {
  if (icon === "plus") return <Icon name="plus" size={15} strokeWidth={2.5} />;
  if (icon === "refresh") {
    return (
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 12a8 8 0 1 1-2.35-5.65M20 4v6h-6"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (icon === "upload") {
    return (
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 16V4m0 0 4 4m-4-4-4 4M5 16v3h14v-3"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

// ── Page shell ────────────────────────────────────────────────────────────────

export function DashboardPageShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  actions?: Action[];
}) {
  return (
    <section className="dashboard-content dashboard-list-screen">
      <div className="dashboard-screen-head">
        <div>
          <h1 className="dashboard-screen-title">{title}</h1>
          {subtitle ? <p className="dashboard-screen-subtitle">{subtitle}</p> : null}
        </div>
        {actions?.length ? (
          <div className="dashboard-screen-actions">
            {actions.map((action) => (
              <button
                className={`dashboard-screen-action dashboard-screen-action-${action.kind ?? "secondary"}`}
                key={action.label}
                type="button"
              >
                <ActionIcon icon={action.icon} />
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

// ── Toolbar primitives ────────────────────────────────────────────────────────

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="dashboard-search-field">
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input placeholder={placeholder} type="search" />
    </div>
  );
}

export function CheckboxFilter({ label }: { label: string }) {
  return (
    <label className="dashboard-checkbox-filter">
      <span className="dashboard-checkbox-box" />
      {label}
    </label>
  );
}

// ── Stat tabs ─────────────────────────────────────────────────────────────────

export function StatTabs({ stats }: { stats: Stat[] }) {
  return (
    <div
      className="dashboard-stat-grid"
      style={{ "--stat-count": stats.length } as React.CSSProperties}
    >
      {stats.map((stat) => (
        <button
          className={`dashboard-stat-card ${stat.active ? "dashboard-stat-card-active" : ""}`}
          key={stat.label}
          type="button"
        >
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Data table ────────────────────────────────────────────────────────────────

export function DataTable({
  columns,
  empty,
  shaded = false,
}: {
  columns: ReadonlyArray<ColumnDef>;
  empty: React.ReactNode;
  shaded?: boolean;
}) {
  return (
    <div className="dashboard-data-table-wrap">
      <table className="dashboard-data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.label}>
                <span className="inline-flex items-center gap-2">
                  {column.label}
                  {column.icon === "settings" ? (
                    <Icon name="settings" size={14} strokeWidth={2.55} />
                  ) : null}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className={shaded ? "dashboard-data-empty-shaded" : ""}
              colSpan={columns.length}
            >
              {empty}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Empty states ──────────────────────────────────────────────────────────────

export function EmptyIllustration({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="dashboard-empty-state">
      <svg aria-hidden="true" width="112" height="92" viewBox="0 0 129 104" fill="none">
        <rect x="28" y="12" width="74" height="72" rx="8" fill="#F3F6FB" stroke="#CBD4E3" strokeWidth="2" />
        <path d="M28 27h74M34 84h62M23 91h84M21 96h88" stroke="#CBD4E3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="27" r="14" fill="#F8FAFD" stroke="#CBD4E3" strokeWidth="2" />
        <path d="M42 18v18M37 22c2-2.3 9-2.3 10 1 .8 2.7-2.3 3.6-5.1 3.6s-5.6.9-4.9 3.6c.8 3.1 8.7 3.1 10.2.5" stroke="#CBD4E3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="86" cy="39" r="14" fill="#F8FAFD" stroke="#CBD4E3" strokeWidth="2" />
        <path d="M79 36h13M79 41h10M82 46h7" stroke="#CBD4E3" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="59" r="15" fill="#F8FAFD" stroke="#CBD4E3" strokeWidth="2" />
        <path d="M55 58h10M60 53v10" stroke="#CBD4E3" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="dashboard-empty-title">{title}</p>
      {description ? <p className="dashboard-empty-copy">{description}</p> : null}
    </div>
  );
}

export function PlainEmpty({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-plain-empty">{children}</div>;
}
