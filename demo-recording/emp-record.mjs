// Employee-side recorder — a REAL recipient (Maya, 0xBa1F…9485) claims her
// streamed pay on Arc, then opens the CCTP send-home flow. Injected signer routes
// to viem in Node with Maya's key (from scripts/.demo-wallets.json; stays in Node).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createWalletClient, defineChain, http, publicActions, hexToBigInt } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const BASE = "http://localhost:3001";
const RPC = "https://rpc.testnet.arc.network";
const ARCSCAN = "https://testnet.arcscan.app";

const durs = Object.fromEntries(
  JSON.parse(readFileSync(`${HERE}narration/durations.json`, "utf8")).map((d) => [d.id, d.dur])
);
const beat = (id, min = 3) => Math.max(min, (durs[id] || min) + 0.6) * 1000;

const w0 = JSON.parse(readFileSync(`${HERE}../scripts/.demo-wallets.json`, "utf8"))["0"];
const pk = w0.privateKey || w0.pk || w0.key;
const account = privateKeyToAccount(pk);
const arc = defineChain({ id: 5042002, name: "Arc Testnet", nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, rpcUrls: { default: { http: [RPC] } } });
const wallet = createWalletClient({ account, chain: arc, transport: http() }).extend(publicActions);

const injectSrc = `
(() => {
  const ADDR = ${JSON.stringify(account.address)}, CHAIN = "0x4cef32", RPC = ${JSON.stringify(RPC)};
  const L = {};
  async function rpc(m,p){ const r=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:m,params:p||[]})}); const j=await r.json(); if(j.error) throw Object.assign(new Error(j.error.message),{code:j.error.code}); return j.result; }
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
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: `${HERE}video-emp`, size: { width: 1440, height: 900 } } });
const hashes = [];
await ctx.exposeBinding("__sendTx", async (_s, tx) => {
  const hash = await wallet.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ? hexToBigInt(tx.value) : undefined, gas: tx.gas ? hexToBigInt(tx.gas) : undefined });
  console.log(`[tx] ${hash}`); hashes.push(hash); return hash;
});
await ctx.exposeBinding("__signMessage", async (_s, m) => wallet.signMessage({ message: typeof m === "string" && m.startsWith("0x") ? { raw: m } : m }));
await ctx.addInitScript(injectSrc);

const page = await ctx.newPage();
const t0 = Date.now();
const marks = [];
const mark = (id) => { marks.push({ id, at: Date.now() - t0 }); console.log(`[beat] ${id} @ ${((Date.now() - t0) / 1000).toFixed(1)}s`); };

try {
  mark("employee");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  // connect (button text varies: Connect / Connect wallet / Launch)
  for (const rx of [/connect wallet/i, /^connect$/i, /launch/i, /connect/i]) {
    const b = page.getByRole("button", { name: rx }).first();
    if (await b.count().catch(() => 0)) { await b.click().catch(() => {}); break; }
  }
  await page.waitForTimeout(3500); // portal loads, claimable ticks
  // claim (real tx)
  await page.getByRole("button", { name: /claim to wallet|^claim/i }).first().click({ timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(Math.max(12000, beat("employee")));

  // send home — open the CCTP modal (initiate the burn if reachable)
  mark("sendhome");
  await page.getByRole("button", { name: /send home/i }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /^send home$/i }).last().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(Math.max(10000, beat("sendhome")));

  mark("end");
} catch (e) {
  console.error("[emp] error:", String(e).split("\n")[0]);
} finally {
  const video = page.video();
  await ctx.close();
  await browser.close();
  writeFileSync(`${HERE}marks-emp.json`, JSON.stringify({ marks, hashes, video: video ? await video.path() : null }, null, 2));
  console.log("[emp] hashes:", hashes.join(", "));
  console.log("[emp] done");
}
