import { Icon } from "./icons";

export function Dropdown({ label }: { label: string }) {
  return (
    <button className="dashboard-dropdown" type="button" aria-haspopup="listbox">
      <span>{label}</span>
      <Icon name="chevronDown" size={15} strokeWidth={2.5} />
    </button>
  );
}
