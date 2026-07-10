import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const HERE = fileURLToPath(new URL(".", import.meta.url));

const base = (inner) => `<!doctype html><html><head><style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Poppins:wght@400;500&display=swap');
  *{margin:0;box-sizing:border-box}
  body{width:1440px;height:900px;background:radial-gradient(1200px 800px at 50% 38%, #1a0f07 0%, #0a0a0b 60%);display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;overflow:hidden}
  .wrap{text-align:center;position:relative;z-index:2}
  .glow{position:absolute;inset:0;background:radial-gradient(600px 400px at 50% 42%, rgba(255,106,26,0.22), transparent 70%);z-index:1}
  .badge{display:inline-block;font-family:'Poppins';font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:#ff6a1a;margin-bottom:26px}
  h1{font-size:96px;font-weight:700;letter-spacing:-.03em;color:#fff;line-height:1.02}
  h1 .o{color:#ff6a1a}
  p{font-family:'Poppins';font-size:26px;color:#b9b9c0;margin-top:22px;font-weight:400}
  .foot{font-family:'Poppins';font-size:16px;color:#6b6b72;margin-top:40px;letter-spacing:.02em}
</style></head><body><div class="glow"></div><div class="wrap">${inner}</div></body></html>`;

const TITLE = base(`
  <div class="badge">Live product demo</div>
  <h1>Mag<span class="o">mos</span></h1>
  <p>Real-time cross-border payroll on Circle Arc</p>
  <div class="foot">Every transaction in this video is real, on Arc testnet</div>`);

const CLOSE = base(`
  <div class="badge">End to end · on Arc</div>
  <h1>Payroll that arrives<br><span class="o">every second.</span></h1>
  <p>Fund once · stream forever · claim anytime · bridge home</p>
  <div class="foot">github.com/nickthelegend/magmos</div>`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [name, html] of [["title", TITLE], ["close", CLOSE]]) {
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // let fonts load
  await page.screenshot({ path: `${HERE}cards/${name}.png` });
  console.log("card:", name);
}
await browser.close();
