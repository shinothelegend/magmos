import { chromium } from 'playwright';
const ARCSCAN='https://testnet.arcscan.app';
const shots = [
  ['arcscan_topup', '0x3a8d73f65550a0617bc4a7a0ba44772cc0d5045f3f4aa1727b2a5b6374c64171'],
  ['arcscan_invoice', '0x5a43371923e4385ba59639e2370b903f44fd3e4167c4797b817f0c9c7ecc5d35'],
];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:1440,height:900} });
const p = await ctx.newPage();
for (const [name,hash] of shots){
  await p.goto(`${ARCSCAN}/tx/${hash}`, { waitUntil:'domcontentloaded', timeout:35000 }).catch(()=>{});
  await p.waitForFunction((h)=>{const t=document.body.innerText;return t.includes(h.slice(2,10)) || /Success|Confirmed|Transaction Hash/i.test(t);}, hash, { timeout:30000 }).catch(()=>{});
  await p.waitForTimeout(3000);
  await p.screenshot({ path:`cards/${name}.png` });
  const loaded = await p.evaluate((h)=>document.body.innerText.includes(h.slice(2,10)), hash);
  console.log('shot', name, loaded ? '(tx data loaded)' : '(may be skeleton)');
}
await b.close();
