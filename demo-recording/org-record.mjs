// Org-side walkthrough recorder. Injected provider → viem signer in Node
// (deployer key stays in Node). Real txns, visible toasts (with tx hash), and an
// inline Arc block-explorer view. Beat dwells are paced to the narration.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createWalletClient, defineChain, http, publicActions, hexToBigInt } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const BASE = "http://localhost:3100";
const RPC = "https://rpc.testnet.arc.network";
const ARCSCAN = "https://testnet.arcscan.app";

const durs = Object.fromEntries(
  JSON.parse(readFileSync(`${HERE}narration/durations.json`, "utf8")).map((d) => [d.id, d.dur])
);
const beat = (id, min = 3) => Math.max(min, (durs[id] || min) + 0.6) * 1000;

const envRaw = readFileSync(`${HERE}../contracts/.env.deployer`, "utf8");
const pk = envRaw.match(/^DEPLOYER_PRIVATE_KEY=\s*(0x[0-9a-fA-F]+)/m)[1];
const account = privateKeyToAccount(pk);
const arc = defineChain({ id: 5042002, name: "Arc Testnet", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } });
const wallet = createWalletClient({ account, chain: arc, transport: http() }).extend(publicActions);

const injectSrc = `
(() => {
  const ADDR = ${JSON.stringify(account.address)}, CHAIN = "0x4cef32", RPC = ${JSON.stringify(RPC)};
  const L = {};
  async function rpc(m, p){ const r=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:m,params:p||[]})}); const j=await r.json(); if(j.error) throw Object.assign(new Error(j.error.message),{code:j.error.code}); return j.result; }
  window.ethereum = { isMetaMask:true, request: async ({method,params}) => {
    switch(method){
      case "eth_requestAccounts": case "eth_accounts": return [ADDR];
      case "eth_chainId": return CHAIN; case "net_version": return "5042002";
      case "wallet_switchEthereumChain": case "wallet_addEthereumChain": case "wallet_watchAsset": return null;
      case "personal_sign": return await window.__signMessage(params[0]);
      case "eth_sendTransaction": return await window.__sendTx(params[0]);
      default: return await rpc(method, params);
    }
  }, on:(e,c)=>{(L[e]||=[]).push(c);}, removeListener:()=>{} };
})();`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: `${HERE}video-org`, size: { width: 1440, height: 900 } } });
await ctx.exposeBinding("__sendTx", async (_s, tx) => {
  const hash = await wallet.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ? hexToBigInt(tx.value) : undefined, gas: tx.gas ? hexToBigInt(tx.gas) : undefined });
  console.log(`[tx] ${hash}`); hashes.push(hash); return hash;
});
await ctx.exposeBinding("__signMessage", async (_s, m) => wallet.signMessage({ message: typeof m === "string" && m.startsWith("0x") ? { raw: m } : m }));
await ctx.addInitScript(injectSrc);

const page = await ctx.newPage();
const t0 = Date.now();
const marks = [];
const hashes = [];
const mark = (id) => { marks.push({ id, at: Date.now() - t0 }); console.log(`[beat] ${id} @ ${((Date.now() - t0) / 1000).toFixed(1)}s`); };
const nav = (href) => page.click(`a[href="${href}"]`).catch(() => {});
const connect = async () => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(900);
  await page.getByText("Launch Dashboard", { exact: false }).first().click({ timeout: 8000 });
  await page.waitForSelector('aside a[href="/dashboard/payments"]', { timeout: 20000 });
};

try {
  // intro — landing + connect
  mark("intro");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.mouse.wheel(0, 500); await page.waitForTimeout(1600); await page.mouse.wheel(0, -500);
  await page.getByText("Launch Dashboard", { exact: false }).first().click({ timeout: 8000 });
  await page.waitForSelector('aside a[href="/dashboard/payments"]', { timeout: 20000 });
  await page.waitForTimeout(Math.max(1500, beat("intro") - 9000));

  // overview
  mark("overview"); await nav("/dashboard"); await page.waitForTimeout(beat("overview"));

  // payroll — top up (2 real txns), dwell on toast
  mark("payroll"); await nav("/dashboard/payments"); await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /top up pool/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(800); await page.getByPlaceholder("0.00").fill("100"); await page.waitForTimeout(500);
  await page.getByRole("button", { name: /approve & top up/i }).click({ timeout: 10000 });
  await page.waitForTimeout(Math.max(24000, beat("payroll")));

  // arcscan — the top-up tx (inline block explorer)
  mark("arcscan_topup");
  if (hashes[hashes.length - 1]) {
    await page.goto(`${ARCSCAN}/tx/${hashes[hashes.length - 1]}`, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(beat("arcscan_topup"));
  }
  await connect(); // reconnect for the rest

  // employees
  mark("employees"); await nav("/dashboard/customers"); await page.waitForTimeout(beat("employees"));

  // AI — ask a question
  mark("ai"); await nav("/dashboard/ai"); await page.waitForTimeout(1500);
  await page.getByText("What's my runway?", { exact: false }).first().click({ timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(beat("ai"));

  // invoices — pay one (real tx), dwell on toast
  mark("invoices"); await nav("/dashboard/invoices"); await page.waitForTimeout(2000);
  // create one first so there's something to pay
  await page.getByRole("button", { name: /create invoice/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(700);
  await page.getByPlaceholder(/Acme|Jane|recipient/i).first().fill("Aurora Studio").catch(() => {});
  await page.getByPlaceholder("0x…").first().fill("0x71C7656EC7ab88b098defB751B7401B5f6d8976F").catch(() => {});
  await page.getByPlaceholder("0.00").first().fill("40").catch(() => {});
  await page.getByRole("button", { name: /^create invoice$/i }).last().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(3500);
  await page.getByRole("button", { name: /^pay$/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(Math.max(12000, beat("invoices")));

  // arcscan — the invoice payment
  mark("arcscan_invoice");
  if (hashes[hashes.length - 1]) {
    await page.goto(`${ARCSCAN}/tx/${hashes[hashes.length - 1]}`, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(beat("arcscan_invoice"));
  }
  await connect();

  // commerce — payment links + products
  mark("commerce"); await nav("/dashboard/payment-links"); await page.waitForTimeout(beat("commerce") / 2);
  await nav("/dashboard/products"); await page.waitForTimeout(beat("commerce") / 2);

  // developer — treasury deposit (real tx)
  mark("developer"); await nav("/dashboard/developer/api-keys"); await page.waitForTimeout(2500);
  await page.getByRole("button", { name: /^deposit$/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(700);
  await page.getByPlaceholder("0.00").first().fill("50").catch(() => {});
  await page.getByRole("button", { name: /approve & deposit/i }).click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(Math.max(16000, beat("developer")));

  mark("end");
} catch (e) {
  console.error("[org] error:", String(e).split("\n")[0]);
} finally {
  const video = page.video();
  await ctx.close();
  await browser.close();
  writeFileSync(`${HERE}marks-org.json`, JSON.stringify({ marks, hashes, video: video ? await video.path() : null }, null, 2));
  console.log("[org] hashes:", hashes.join(", "));
  console.log("[org] done");
}
