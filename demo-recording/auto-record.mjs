// Fully automated demo recorder — NO MetaMask, NO Synpress.
// An injected EIP-1193 provider routes signing to viem in Node (the deployer key
// never enters the browser). Every transaction is REAL on Arc testnet. Playwright
// records the headless run to a video; we mux it to MP4 at the end.

import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { createWalletClient, defineChain, http, publicActions, hexToBigInt } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const BASE = "http://localhost:3100";
const RPC = "https://rpc.testnet.arc.network";
const OUTDIR = "./video";

// ── deployer key (read in Node only; never printed, never sent to the browser) ──
const envRaw = readFileSync(new URL("../contracts/.env.deployer", import.meta.url), "utf8");
const pk = envRaw.match(/^DEPLOYER_PRIVATE_KEY=\s*(0x[0-9a-fA-F]+)/m)?.[1];
if (!pk) throw new Error("DEPLOYER_PRIVATE_KEY not found in ../contracts/.env.deployer");
const account = privateKeyToAccount(pk);

const arc = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
  blockExplorers: { default: { name: "Arcscan", url: "https://testnet.arcscan.app" } },
});
const wallet = createWalletClient({ account, chain: arc, transport: http() }).extend(publicActions);

// Browser-side provider: static account/chain, forward reads to the RPC, hand
// signing/sending to the Node bindings.
const injectSrc = `
(() => {
  const ADDR = ${JSON.stringify(account.address)};
  const CHAIN = "0x4cef32"; // 5042002
  const RPC = ${JSON.stringify(RPC)};
  const listeners = {};
  async function rpc(method, params) {
    const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params || [] }) });
    const j = await r.json();
    if (j.error) throw Object.assign(new Error(j.error.message), { code: j.error.code });
    return j.result;
  }
  window.ethereum = {
    isMetaMask: true,
    request: async ({ method, params }) => {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts": return [ADDR];
        case "eth_chainId": return CHAIN;
        case "net_version": return "5042002";
        case "wallet_switchEthereumChain":
        case "wallet_addEthereumChain":
        case "wallet_watchAsset": return null;
        case "personal_sign": return await window.__signMessage(params[0]);
        case "eth_sendTransaction": return await window.__sendTx(params[0]);
        default: return await rpc(method, params);
      }
    },
    on: (e, cb) => { (listeners[e] ||= []).push(cb); },
    removeListener: () => {},
  };
})();
`;

const log = (m) => console.log(`[rec] ${m}`);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUTDIR, size: { width: 1440, height: 900 } },
});

await ctx.exposeBinding("__sendTx", async (_src, tx) => {
  const hash = await wallet.sendTransaction({
    to: tx.to,
    data: tx.data,
    value: tx.value ? hexToBigInt(tx.value) : undefined,
    gas: tx.gas ? hexToBigInt(tx.gas) : undefined,
  });
  console.log(`[tx]  ${hash}`);
  return hash;
});
await ctx.exposeBinding("__signMessage", async (_src, message) => {
  const m = typeof message === "string" && message.startsWith("0x") ? { raw: message } : message;
  return await wallet.signMessage({ message: m });
});
await ctx.addInitScript(injectSrc);

const page = await ctx.newPage();
const sidebar = (href) => page.click(`a[href="${href}"]`).catch(() => {});

try {
  // 1) Landing → connect (auto via injected provider) → dashboard
  log("landing → launch");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1400);
  await page.getByText("Launch Dashboard", { exact: false }).first().click({ timeout: 8000 });
  await page.waitForSelector('aside a[href="/dashboard/payments"]', { timeout: 20000 });
  await page.waitForTimeout(1000);

  // 2) Overview — let the live streaming tickers run on camera
  log("overview — streaming");
  await sidebar("/dashboard");
  await page.waitForTimeout(6500);

  // 3) Payroll — top up the pool: REAL approve + deposit signatures
  log("payroll — top up (2 real txns)");
  await sidebar("/dashboard/payments");
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: /top up pool/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(900);
  await page.getByPlaceholder("0.00").fill("100");
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /approve & top up/i }).click({ timeout: 10000 });
  // approve + deposit happen (the app waits for each receipt); give it room.
  await page.waitForTimeout(28000);

  // 4) Overview again — updated pool, still streaming
  log("overview — updated");
  await sidebar("/dashboard");
  await page.waitForTimeout(7000);
  log("flow complete");
} catch (e) {
  console.error("[rec] flow error:", String(e).split("\n")[0]);
} finally {
  const video = page.video();
  await ctx.close(); // finalizes the recording
  await browser.close();
  const path = video ? await video.path() : null;
  console.log(`[rec] video: ${path}`);
}
