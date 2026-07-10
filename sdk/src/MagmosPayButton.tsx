import { useState, type CSSProperties, type ReactNode } from "react";
import { MagmosProvider } from "./MagmosProvider";
import { PayModal, type PayModalProps } from "./PayModal";
import { theme } from "./theme";
import type { MagmosNetwork } from "./types";

export interface MagmosPayButtonProps
  extends Omit<PayModalProps, "open" | "onClose"> {
  /** Button label. Defaults to "Pay with Magmos". */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** HashKey Chain network to connect to. Defaults to testnet. */
  network?: MagmosNetwork;
  /** Render your own trigger instead of the default button. */
  render?: (open: () => void) => ReactNode;
}

// One-line integration: drop this in, pass your publishable key + amount, done.
// Bundles its own wallet + query providers so the host app needs no Arc setup.
export function MagmosPayButton({ children, className, style, network = "testnet", render, ...modalProps }: MagmosPayButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <MagmosProvider network={network}>
      {render ? (
        render(() => setOpen(true))
      ) : (
        <button
          type="button"
          className={className}
          onClick={() => setOpen(true)}
          style={
            className
              ? style
              : {
                  borderRadius: 9999,
                  border: "none",
                  background: theme.mint,
                  color: "#000",
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: theme.font,
                  ...style,
                }
          }
        >
          {children ?? "Pay with Magmos"}
        </button>
      )}
      <PayModal {...modalProps} open={open} onClose={() => setOpen(false)} />
    </MagmosProvider>
  );
}
