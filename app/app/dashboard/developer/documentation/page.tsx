import Link from "next/link";
import { CodeBlock, H2, P } from "@/components/dashboard/developer/doc-ui";

export default function DocumentationPage() {
  return (
    <div className="dashboard-content mx-auto w-full max-w-3xl pt-7">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">Documentation</h1>
      <p className="mt-1 text-[13.5px] text-[var(--sw-text-muted)]">
        Accept USDC &amp; USDC payments in your own app with the{" "}
        <a
          href="https://www.npmjs.com/package/@magmos/sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--sw-mint)] hover:underline"
        >
          @magmos/sdk
        </a>{" "}
        SDK, one component, no Arc setup required.
      </p>

      <H2>1. Install</H2>
      <P>
        Add the SDK to your React or Next.js project. React 18+ is a peer dependency. View the
        package on{" "}
        <a
          href="https://www.npmjs.com/package/@magmos/sdk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--sw-mint)] hover:underline"
        >
          npm
        </a>
        .
      </P>
      <CodeBlock code={`npm install @magmos/sdk`} />

      <H2>2. Get your API key</H2>
      <P>
        Generate a publishable key (<code>pk_live_…</code>) from{" "}
        <Link href="/dashboard/developer/api-keys" className="text-[var(--sw-mint)] hover:underline">
          Developer → API keys
        </Link>
        . It maps to your receiving wallet and is safe to ship in client code. Store it in an env var.
      </P>
      <CodeBlock code={`# .env
NEXT_PUBLIC_SWEEM_API_KEY=pk_live_xxxxxxxxxxxxxxxx`} />

      <H2>3. Add the pay button</H2>
      <P>Drop the button in anywhere. It bundles its own wallet + query providers.</P>
      <CodeBlock
        code={`import { MagmosPayButton } from "@magmos/sdk";

export function Checkout() {
  return (
    <MagmosPayButton
      apiKey={process.env.NEXT_PUBLIC_SWEEM_API_KEY!}
      amount={49.99}
      onSuccess={(r) => console.log("Paid! tx:", r.digest)}
    >
      Pay $49.99
    </MagmosPayButton>
  );
}`}
      />
      <P>
        Clicking it opens the Magmos checkout modal: the payer connects a Arc wallet, picks a token, and
        pays your receiving address. <code>onSuccess</code> fires with the transaction digest.
      </P>

      <H2>Props</H2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--sw-border)]">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[var(--sw-card-inset)] text-[12px] text-[var(--sw-text-muted)]">
            <tr>
              <th className="px-4 py-2.5 font-medium">Prop</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="text-[var(--sw-text-muted)]">
            {[
              ["apiKey", "string", "Your publishable key (required)."],
              ["amount", "number", "Amount to charge in token units (required)."],
              ["token", `"USDC" | "USDC"`, "Lock to one token; omit to let the payer choose."],
              ["network", `"mainnet" | "testnet"`, "Defaults to mainnet."],
              ["onSuccess", "(r) => void", "Fires with the tx digest after a confirmed payment."],
              ["onError", "(e) => void", "Fires if the payment fails."],
              ["render", "(open) => ReactNode", "Render a custom trigger instead of the default button."],
            ].map(([prop, type, desc]) => (
              <tr key={prop} className="border-t border-[var(--sw-border)]">
                <td className="px-4 py-2.5 font-mono text-[12.5px] text-[var(--sw-text)]">{prop}</td>
                <td className="px-4 py-2.5 font-mono text-[12px]">{type}</td>
                <td className="px-4 py-2.5">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Lock to a token</H2>
      <P>Pass <code>token</code> to skip the picker and charge a specific asset.</P>
      <CodeBlock code={`<MagmosPayButton apiKey={KEY} amount={10} token="USDC" />`} />

      <H2>Custom trigger</H2>
      <P>Use the <code>render</code> prop to wire the modal to your own UI.</P>
      <CodeBlock
        code={`<MagmosPayButton
  apiKey={KEY}
  amount={10}
  render={(open) => <MyButton onClick={open}>Checkout</MyButton>}
/>`}
      />

      <H2>Already using dapp-kit?</H2>
      <P>
        If your app already wraps <code>wagmi</code> providers, render the modal directly and
        skip the bundled provider.
      </P>
      <CodeBlock
        code={`import { PayModal } from "@magmos/sdk";

<PayModal open={open} onClose={close} apiKey={KEY} amount={20} />`}
      />

      <H2>Local testing without a key</H2>
      <P>Pass <code>recipient</code> (and optionally <code>merchant</code>) to bypass the backend lookup.</P>
      <CodeBlock code={`<MagmosPayButton apiKey="pk_test" amount={1} recipient="0xMERCHANT…" merchant="Acme" />`} />

      <H2>Webhooks</H2>
      <P>
        Want server-side confirmation? Register an endpoint under{" "}
        <Link href="/dashboard/developer/webhooks" className="text-[var(--sw-mint)] hover:underline">
          Developer → Webhooks
        </Link>{" "}
        to receive signed <code>payment.succeeded</code> events.
      </P>
    </div>
  );
}
