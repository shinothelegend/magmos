import { CodeBlock, Endpoint, H2, P } from "@/components/dashboard/developer/doc-ui";

export default function ApiReferencePage() {
  return (
    <div className="dashboard-content mx-auto w-full max-w-3xl pt-7">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--sw-text)]">API reference</h1>
      <p className="mt-1 text-[13.5px] text-[var(--sw-text-muted)]">
        The REST API behind the checkout SDK and dashboard. JSON over HTTPS.
      </p>

      <H2>Base URL</H2>
      <CodeBlock code={`https://api.magmos.app`} />

      <H2>Authentication</H2>
      <P>
        Write endpoints are authenticated with a Arc wallet personal-message signature. Sign a message
        of the form <code>magmos-auth:&lt;address&gt;:&lt;unixMs&gt;</code> (60s TTL) and send:
      </P>
      <CodeBlock
        code={`X-Wallet-Address: 0x<your org wallet>
X-Signature:      <base64 signature>
X-Message:        magmos-auth:0xAbc…:1782000000000`}
      />
      <P>Public endpoints (checkout config, key listing) need no auth.</P>

      <H2>Checkout</H2>
      <div className="mt-3 flex flex-col gap-3">
        <Endpoint
          method="GET"
          path="/v1/checkout/config?pk={key}"
          desc="Resolve a publishable key into merchant checkout config. Called by the SDK from any origin."
        >
          <p className="mt-3 text-[12px] font-medium text-[var(--sw-text-muted)]">200 OK</p>
          <CodeBlock
            code={`{
  "merchant": "Acme Inc",
  "logoUrl": "https://…",
  "recipient": "0xMERCHANT…",
  "tokens": ["USDC", "USDC"]
}`}
          />
        </Endpoint>
      </div>

      <H2>API keys</H2>
      <div className="mt-3 flex flex-col gap-3">
        <Endpoint
          method="GET"
          path="/v1/orgs/{wallet}/keys"
          desc="List an org's active publishable keys, newest first. Publishable keys are client-safe."
        >
          <p className="mt-3 text-[12px] font-medium text-[var(--sw-text-muted)]">200 OK</p>
          <CodeBlock
            code={`[
  {
    "id": "uuid",
    "orgWallet": "0x…",
    "name": "Production",
    "key": "pk_live_…",
    "receivingAddress": null,
    "createdAt": "2026-06-21T00:00:00.000Z"
  }
]`}
          />
        </Endpoint>

        <Endpoint
          method="POST"
          path="/v1/orgs/{wallet}/keys"
          auth
          desc="Create a publishable key for a project. The signer must own the org."
        >
          <p className="mt-3 text-[12px] font-medium text-[var(--sw-text-muted)]">Request body</p>
          <CodeBlock
            code={`{
  "name": "Production",
  "receiving_address": "0x…"   // optional; defaults to the org wallet
}`}
          />
          <p className="mt-3 text-[12px] font-medium text-[var(--sw-text-muted)]">201 Created</p>
          <CodeBlock
            code={`{ "id": "uuid", "name": "Production", "key": "pk_live_…", "createdAt": "…" }`}
          />
        </Endpoint>

        <Endpoint
          method="DELETE"
          path="/v1/orgs/{wallet}/keys/{id}"
          auth
          desc="Revoke a key. Apps using it stop resolving immediately."
        >
          <p className="mt-3 text-[12px] font-medium text-[var(--sw-text-muted)]">200 OK</p>
          <CodeBlock code={`{ "revoked": true }`} />
        </Endpoint>
      </div>

      <H2>Errors</H2>
      <P>Errors return a JSON body with an <code>error</code> code and a human <code>message</code>.</P>
      <CodeBlock
        code={`{ "error": "http_error", "message": "Invalid API key" }   // 404
{ "error": "http_error", "message": "Invalid signature" }  // 401`}
      />
    </div>
  );
}
