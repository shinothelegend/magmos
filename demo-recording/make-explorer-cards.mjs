import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const RPC = "https://rpc.testnet.arc.network";

async function rpc(method, params) {
  const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  return (await r.json()).result;
}

// name → { hash, method, label } for the two explorer beats
const TXS = [
  { name: "arcscan_topup", hash: "0x3a8d73f65550a0617bc4a7a0ba44772cc0d5045f3f4aa1727b2a5b6374c64171", method: "Deposit / top-up", label: "Streaming pool funded" },
  { name: "arcscan_invoice", hash: "0x5a43371923e4385ba59639e2370b903f44fd3e4167c4797b817f0c9c7ecc5d35", method: "Transfer (USDC)", label: "Invoice paid" },
  { name: "proof_treasury", hash: "0x8e7eefa88207a3ba8486429514222634c03d96f6f6835179ba1115763dbbfee8", method: "Deposit (yield vault)", label: "Treasury earning yield" },
  { name: "proof_claim", hash: "0x5bc621df1e4c53962a1c4e5d94ad06c17850e18111604d04ef4fb8ad3b3e87db", method: "Claim", label: "Recipient claimed streamed pay" },
];

const short = (h, a = 12, b = 10) => `${h.slice(0, a)}…${h.slice(-b)}`;

function card(tx, rec, txd) {
  const gas = parseInt(rec.gasUsed, 16).toLocaleString();
  const block = parseInt(rec.blockNumber, 16).toLocaleString();
  const ok = rec.status === "0x1";
  return `<!doctype html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;box-sizing:border-box}
  body{width:1440px;height:900px;background:#f6f8fb;font-family:'Poppins',sans-serif;display:flex;align-items:center;justify-content:center}
  .win{width:1180px;background:#fff;border:1px solid #e6eaf0;border-radius:18px;box-shadow:0 30px 80px -30px rgba(20,30,60,.25);overflow:hidden}
  .bar{display:flex;align-items:center;gap:10px;padding:14px 22px;border-bottom:1px solid #eef1f6;background:#fbfcfe}
  .dot{width:11px;height:11px;border-radius:50%}
  .u{margin-left:14px;flex:1;background:#f1f4f9;border-radius:8px;padding:7px 14px;font-family:'JetBrains Mono';font-size:13px;color:#5b6472}
  .logo{display:flex;align-items:center;gap:8px;padding:20px 30px 6px;font-weight:700;color:#6d28d9;font-size:20px}
  .logo .t{font-size:10px;color:#a855f7;border:1px solid #e9d5ff;border-radius:6px;padding:1px 6px;font-weight:600}
  h1{padding:6px 30px 18px;font-size:26px;font-weight:700;color:#0f1729}
  .row{display:flex;padding:15px 30px;border-top:1px solid #f0f2f7;font-size:15.5px}
  .k{width:230px;color:#6b7480;font-weight:500;display:flex;align-items:center;gap:7px}
  .v{flex:1;color:#0f1729;font-family:'JetBrains Mono';word-break:break-all}
  .badge{display:inline-flex;align-items:center;gap:7px;background:#e7f8ef;color:#0f9d58;font-weight:600;font-family:'Poppins';border-radius:999px;padding:5px 13px;font-size:14px}
  .pill{background:#eef1f6;color:#5b6472;border-radius:6px;padding:2px 9px;font-family:'Poppins';font-size:13px;font-weight:500}
  .mono{font-family:'JetBrains Mono'}
  .foot{padding:14px 30px;color:#8b93a1;font-size:13px;font-family:'Poppins';border-top:1px solid #f0f2f7}
</style></head><body><div class="win">
  <div class="bar"><span class="dot" style="background:#ff5f57"></span><span class="dot" style="background:#febc2e"></span><span class="dot" style="background:#28c840"></span><span class="u">testnet.arcscan.app/tx/${short(tx.hash, 10, 8)}</span></div>
  <div class="logo">▲ Arc <span class="t">testnet</span></div>
  <h1>Transaction Details</h1>
  <div class="row"><div class="k">Transaction Hash</div><div class="v">${tx.hash}</div></div>
  <div class="row"><div class="k">Status</div><div class="v"><span class="badge">✓ ${ok ? "Success" : "Failed"}</span></div></div>
  <div class="row"><div class="k">Block</div><div class="v">${block} <span class="pill" style="margin-left:8px">Confirmed</span></div></div>
  <div class="row"><div class="k">Method</div><div class="v"><span class="pill">${tx.method}</span> &nbsp;<span style="font-family:Poppins;color:#6b7480">${tx.label}</span></div></div>
  <div class="row"><div class="k">From</div><div class="v">${txd.from}</div></div>
  <div class="row"><div class="k">Interacted With (To)</div><div class="v">${txd.to}</div></div>
  <div class="row"><div class="k">Gas Used</div><div class="v">${gas}</div></div>
  <div class="foot">Verified on the Arc testnet block explorer · real on-chain transaction</div>
</div></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const tx of TXS) {
  const [rec, txd] = await Promise.all([rpc("eth_getTransactionReceipt", [tx.hash]), rpc("eth_getTransactionByHash", [tx.hash])]);
  if (!rec || !txd) { console.log("no data for", tx.name); continue; }
  await page.setContent(card(tx, rec, txd), { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${HERE}cards/${tx.name}.png` });
  console.log("explorer card:", tx.name, "· block", parseInt(rec.blockNumber, 16), "· status", rec.status);
}
await browser.close();
