import {
  DashboardPageShell,
  DataTable,
  EmptyIllustration,
  StatTabs,
} from "@/components/dashboard/dashboard-screen";

const columns = [
  { label: "Name" },
  { label: "Description" },
  { label: "Type" },
  { label: "Price" },
  { label: "Status" },
  { label: "Interval" },
  { label: "More" },
];

export default function ProductsPage() {
  return (
    <DashboardPageShell
      title="Products"
      actions={[{ label: "Add product", kind: "primary", icon: "plus" }]}
    >
      <StatTabs
        stats={[
          { label: "All products", value: "0" },
          { label: "Active", value: "0", active: true },
          { label: "Deactivated", value: "0" },
        ]}
      />
      <DataTable
        shaded
        columns={columns}
        empty={
          <EmptyIllustration
            title="No products yet"
            description="Please try changing filters. Otherwise, create a product to start accepting payments."
          />
        }
      />
    </DashboardPageShell>
  );
}
