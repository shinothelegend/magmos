// Assemble the final narrated demo:
//   [title] + [org walkthrough] + [employee side] + [close]
// Narration segments are placed at their recorded beat timestamps (perfect sync),
// mixed with a soft BGM bed. Every on-screen tx is real.

import { fileURLToPath } from "node:url";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const R = (p) => `${HERE}${p}`;
const sh = (c) => {
  try { return execSync(c, { stdio: ["ignore", "pipe", "pipe"] }).toString().trim(); }
  catch (e) {
    console.error("FAILED:", c.slice(0, 260));
    console.error("STDERR:", (e.stderr?.toString() || "").split("\n").filter(Boolean).slice(-5).join("\n  "));
    throw e;
  }
};
const probe = (f) => parseFloat(sh(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`));
const webmIn = (dir) => `${HERE}${dir}/${readdirSync(R(dir)).find((f) => f.endsWith(".webm"))}`;

const TITLE = 3.5;
const durs = Object.fromEntries(JSON.parse(readFileSync(R("narration/durations.json"), "utf8")).map((d) => [d.id, d.dur]));
const orgM = JSON.parse(readFileSync(R("marks-org.json"), "utf8"));
const empM = existsSync(R("marks-emp.json")) ? JSON.parse(readFileSync(R("marks-emp.json"), "utf8")) : { marks: [] };

const orgWebm = webmIn("video-org");
const empWebm = empM.marks.length ? webmIn("video-emp") : null;
const orgDur = probe(orgWebm);
const empDur = empWebm ? probe(empWebm) : 0;
const closeDur = (durs.close || 10) + 1.2;

// ── Pass 1: normalize each segment to identical h264, then concat ──────────
mkdir("work");
const enc = `-vf "scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p" -c:v libx264 -preset veryfast -crf 20 -an`;
sh(`ffmpeg -y -loop 1 -t ${TITLE} -i "${R("cards/title.png")}" ${enc} "${R("work/00-title.mp4")}"`);

// org: overlay the real block-explorer receipt cards during the arcscan beats
// (arcscan's own frontend won't render headless, so we show real RPC data instead).
const at = (id) => (orgM.marks.find((m) => m.id === id)?.at ?? 0) / 1000;
const tuS = at("arcscan_topup"), tuE = at("employees") || tuS + 14;
const ivS = at("arcscan_invoice"), ivE = at("commerce") || ivS + 12;
const ov = `[0:v]scale=1440:900,fps=30,format=yuv420p[b];[1:v]scale=1440:900[c1];[2:v]scale=1440:900[c2];[b][c1]overlay=enable='between(t,${tuS},${tuE})'[b1];[b1][c2]overlay=enable='between(t,${ivS},${ivE})'[v]`;
sh(`ffmpeg -y -i "${orgWebm}" -i "${R("cards/arcscan_topup.png")}" -i "${R("cards/arcscan_invoice.png")}" -filter_complex "${ov}" -map "[v]" -c:v libx264 -preset veryfast -crf 20 -an "${R("work/10-org.mp4")}"`);
if (empWebm) sh(`ffmpeg -y -i "${empWebm}" ${enc} "${R("work/20-emp.mp4")}"`);
sh(`ffmpeg -y -loop 1 -t ${closeDur} -i "${R("cards/close.png")}" ${enc} "${R("work/90-close.mp4")}"`);

const parts = ["work/00-title.mp4", "work/10-org.mp4", empWebm ? "work/20-emp.mp4" : null, "work/90-close.mp4"].filter(Boolean);
const listTxt = parts.map((p) => `file '${R(p)}'`).join("\n");
sh(`printf ${JSON.stringify(listTxt)} > "${R("work/list.txt")}"`);
sh(`ffmpeg -y -f concat -safe 0 -i "${R("work/list.txt")}" -c copy "${R("work/video.mp4")}"`);
const videoDur = probe(R("work/video.mp4"));

// ── Pass 2: narration placed at beat marks + BGM ──────────────────────────
// segment → absolute start (s) in the final timeline
const placements = [];
for (const m of orgM.marks) if (m.id !== "end" && durs[m.id]) placements.push({ id: m.id, at: TITLE + m.at / 1000 });
for (const m of empM.marks) if (m.id !== "end" && durs[m.id]) placements.push({ id: m.id, at: TITLE + orgDur + m.at / 1000 });
placements.push({ id: "close", at: TITLE + orgDur + empDur + 0.4 });

const inputs = placements.map((p) => `-i "${R(`narration/${p.id}.wav`)}"`).join(" ");
const bgm = "/Volumes/Extreme SSD/Projects/arc/videos/magmos-launch/assets/bgm/track.wav";
const hasBgm = existsSync(bgm);
const delays = placements.map((p, i) => `[${i}:a]aresample=44100,adelay=${Math.round(p.at * 1000)}:all=1[v${i}]`).join(";");
const vlabels = placements.map((_, i) => `[v${i}]`).join("");
// Step A — narration track (each segment placed at its beat mark)
sh(`ffmpeg -y ${inputs} -filter_complex "${delays};${vlabels}amix=inputs=${placements.length}:normalize=0:duration=longest[a]" -map "[a]" -t ${videoDur} -ar 44100 -ac 2 "${R("work/narr.wav")}"`);
// Step B — mix a soft BGM bed under it
if (hasBgm) {
  sh(`ffmpeg -y -i "${R("work/narr.wav")}" -stream_loop -1 -i "${bgm}" -filter_complex "[1:a]aresample=44100,volume=0.09[b];[0:a][b]amix=inputs=2:normalize=0:duration=first[a]" -map "[a]" -t ${videoDur} "${R("work/audio.wav")}"`);
} else {
  sh(`cp "${R("work/narr.wav")}" "${R("work/audio.wav")}"`);
}

// ── mux ───────────────────────────────────────────────────────────────────
sh(`ffmpeg -y -i "${R("work/video.mp4")}" -i "${R("work/audio.wav")}" -c:v copy -c:a aac -b:a 192k -movflags +faststart -shortest "${R("renders/magmos-full-demo.mp4")}"`);
console.log(`DONE → renders/magmos-full-demo.mp4  (${videoDur.toFixed(1)}s)`);
console.log(`beats: ${placements.map((p) => p.id).join(", ")}`);

function mkdir(d) { try { execSync(`mkdir -p "${R(d)}" "${R("renders")}"`); } catch {} }
