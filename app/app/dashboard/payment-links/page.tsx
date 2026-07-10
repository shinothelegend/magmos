import {
  DashboardPageShell,
  DataTable,
  EmptyIllustration,
  StatTabs,
} from "@/components/dashboard/dashboard-screen";

const columns = [
  { label: "Url" },
  { label: "Title" },
  { label: "Tags" },
  { label: "Created on" },
  { label: "Amount" },
  { label: "Status" },
  { label: "More" },
];

export default function PaymentLinksPage() {
  return (
    <DashboardPageShell
      title="Payment links"
      actions={[{ label: "Create payment link", kind: "primary", icon: "plus" }]}
    >
      <StatTabs
        stats={[
          { label: "All payment links", value: "0" },
          { label: "Active", value: "0", active: true },
          { label: "Deactivated", value: "0" },
        ]}
      />
      <DataTable
        shaded
        columns={columns}
        empty={
          <EmptyIllustration
            title="No active payment links found"
            description="Please try changing filters. Otherwise, you can create a new payment link."
          />
        }
      />
    </DashboardPageShell>
  );
}
