import type { ReactNode } from "react";
import { Dropdown } from "./dropdown";
import { Icon } from "./icons";

const columns = [
  { label: "Date", width: "9%" },
  { label: "Amount", width: "17%" },
  { label: "Status", width: "9%" },
  { label: "Title", width: "20%" },
  { label: "Employee", width: "15%", settings: true },
  { label: "Method", width: "16%" },
  { label: "Compliance", width: "9%" },
  { label: "Action", width: "5%" },
];

export type RecentRow = { key: string; cells: ReactNode[] };

export function RecentPaymentsTable({
  title = "Recent payments",
  rows,
}: {
  title?: string;
  rows?: RecentRow[];
}) {
  return (
    <section className="dashboard-payments" aria-labelledby="payments-heading">
      <div className="dashboard-payments-head">
        <h2 className="dashboard-payments-title" id="payments-heading">
          {title}
        </h2>
        <Dropdown label="All type" />
      </div>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <colgroup>
            {columns.map((column) => (
              <col key={column.label} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.label}>
                  <span className="inline-flex items-center gap-2">
                    {column.label}
                    {column.settings ? (
                      <Icon name="settings" size={14} strokeWidth={2.55} />
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((row) => (
                <tr className="dashboard-pay-row" key={row.key}>
                  {row.cells.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="dashboard-empty-row">
                <td colSpan={columns.length}>
                  <span className="dashboard-empty-illustration" aria-hidden="true">
                    <svg width="129" height="82" viewBox="0 0 129 82" fill="none">
                      <rect x="26" y="10" width="86" height="70" rx="10" stroke="#AAB4C7" strokeWidth="2" />
                      <path d="M26 25h86" stroke="#AAB4C7" strokeWidth="2" />
                      <circle cx="43" cy="25" r="18" fill="#F8FAFD" stroke="#AAB4C7" strokeWidth="2" />
                      <path d="M43 13v24M36 18.5c2.2-3 12.6-3 14 1.5 1.1 3.7-3 5-7 5s-8 1.2-7 5c1.1 4.2 12.2 4.2 14.2.6" stroke="#AAB4C7" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="89" cy="43" r="21" fill="#F8FAFD" stroke="#AAB4C7" strokeWidth="2" />
                      <path d="M79 40h20M79 47h16M82 54h12" stroke="#AAB4C7" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="70" cy="77" r="18" fill="#F8FAFD" stroke="#AAB4C7" strokeWidth="2" />
                      <path d="M63 76h14M70 69v14" stroke="#AAB4C7" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
