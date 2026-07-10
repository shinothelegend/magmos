import { synthesizeOne } from '/Users/jaibajrang/.claude/skills/media-use/audio/scripts/lib/tts.mjs';
import { execSync } from 'node:child_process';
const wavAbs = '/Volumes/Extreme SSD/Projects/arc/magmos/demo-recording/narration/recap.wav';
const text = "Here's the proof. Every transaction in this walkthrough was real, and confirmed on Arc — funding the streaming pool, paying an invoice in U-S-D-C, depositing idle treasury into the yield vault, and the recipient claiming her streamed pay. Real signatures, real on-chain settlements, every hash live on the block explorer. This is Magmos — actually working, end to end.";
const r = await synthesizeOne({ provider:'kokoro', text, voiceId:'am_michael', speed:1.0, wavAbs, hyperframesDir: process.cwd() });
const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${wavAbs}"`).toString().trim());
console.log('recap:', r.ok, dur.toFixed(2)+'s');
