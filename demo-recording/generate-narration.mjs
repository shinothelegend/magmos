import { synthesizeOne } from "/Users/jaibajrang/.claude/skills/media-use/audio/scripts/lib/tts.mjs";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const DIR = "/Volumes/Extreme SSD/Projects/arc/magmos/demo-recording/narration";
mkdirSync(DIR, { recursive: true });

// Each segment = one voiceover beat, paired to a screen beat in the recording.
export const SEGMENTS = [
  ["intro", "This is Magmos — real-time, cross-border payroll built on Circle's Arc. Instead of a payday every two weeks, salaries stream to your team every single second, in U-S-D-C, settled on-chain. Let me walk you through the whole app — and every transaction you'll see is real, on Arc."],
  ["overview", "Here's the org dashboard. Falcon Marketplace is streaming payroll live right now — watch Total Streamed tick up by the second. There's the pool balance, active streams, a runway counter so finance always knows how long funding lasts, and a live feed of every recipient."],
  ["payroll", "Let's fund it. On the Payroll page I'll top up the streaming pool. This is a real transaction — first approve the U-S-D-C spend, then deposit. Keep an eye on the top-right: the toast pops with the actual transaction hash the moment it's signed and broadcast to Arc."],
  ["arcscan_topup", "And there it is on the Arc block explorer — that exact transaction, confirmed, moving U-S-D-C into the streaming pool. Nothing simulated. A real, on-chain settlement anyone can verify."],
  ["employees", "Recipients live on the Employees page. Add anyone by wallet address and monthly rate — Manila, Lagos, Karachi — and Magmos streams their salary per second. Group them, bulk-edit rates, all mirrored to the on-chain payroll roster."],
  ["ai", "Magmos A-I is a payroll copilot, grounded in your live on-chain data. Ask it your runway, who's on payroll, or how much you're streaming a month — and it answers from the real numbers, never a guess."],
  ["invoices", "Invoices settle in U-S-D-C on Arc. I'll pay this one. A single signature fires a real U-S-D-C transfer, the toast shows the transaction hash, and the invoice flips to paid — recorded in the database."],
  ["arcscan_invoice", "Again, the receipt is right there on the block explorer — a real payment, on-chain, verifiable by anyone. This is the difference between a demo and the real thing."],
  ["commerce", "And Magmos is a full commerce stack, not just payroll — shareable payment links, products, and subscription billing. A complete U-S-D-C payments layer, all on Arc."],
  ["developer", "For builders there's an A-P-I, an S-D-K, and webhooks. And idle treasury doesn't sit still — deposit it into the yield vault, an E-R-C forty-six twenty-six rail that routes to Circle's U-S-Y-C in production. This deposit is a real transaction too — hash and all."],
  ["employee", "Now the recipient's side. An employee opens their portal and sees their pay accruing live, second by second. One tap to claim, and the earned U-S-D-C lands in their wallet in about a second — no invoices, no waiting for payday."],
  ["sendhome", "To send it home across borders, Circle's C-C-T-P burns the U-S-D-C on Arc and mints it natively on their home chain — a real cross-border remittance in seconds, for cents, no banks in the middle."],
  ["close", "That's Magmos, end to end — fund once, stream forever, claim anytime, bridge home. Real-time payroll that actually arrives every second, live on Arc. Thanks for watching."],
];

const meta = [];
for (const [id, text] of SEGMENTS) {
  const wavAbs = `${DIR}/${id}.wav`;
  const r = await synthesizeOne({ provider: "kokoro", text, voiceId: "am_michael", speed: 1.0, wavAbs, hyperframesDir: process.cwd() });
  let dur = 0;
  try {
    dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavAbs}"`).toString().trim());
  } catch {}
  meta.push({ id, dur, ok: r.ok });
  console.log(`${r.ok ? "ok " : "ERR"} ${id.padEnd(16)} ${dur.toFixed(2)}s`);
}
const total = meta.reduce((s, m) => s + m.dur, 0);
writeFileSync(`${DIR}/durations.json`, JSON.stringify(meta, null, 2));
console.log(`\nTOTAL narration: ${total.toFixed(1)}s (${(total / 60).toFixed(2)} min)`);
