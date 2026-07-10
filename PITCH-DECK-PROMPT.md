# Magmos — Pitch Deck Mega-Prompt (for Claude Design / Artifacts)

Paste everything below the line into Claude and ask it to build the deck as an interactive HTML artifact.

---

You are a senior pitch-deck designer and startup storyteller. Build me a **14-slide investor/hackathon pitch deck** for **Magmos**, delivered as a single self-contained interactive HTML artifact (one full-viewport slide at a time, arrow-key + on-screen nav, smooth transitions, progress dots). This is a **business pitch**, not a docs page — every slide must earn its place and sell the story.

## The company
**Magmos — real-time USDC payroll & remittances on HashKey Chain.**
Employers fund a pool once; money streams to workers **every second**; workers **claim anytime**, **bridge home** to any chain via Circle CCTP, and cash out to their local bank. Built on **Arc** (Circle's L1 where USDC is the native gas token) for the **Circle hackathon, Track 1 — UAE → Global remittances**.

One-liner: **"Payroll that arrives every second."**
Tagline rhythm: **Fund once · stream forever · claim anytime · bridge home.**
Repo: github.com/nickthelegend/magmos

## Brand system (use exactly)
- **Primary orange** `#FF6A1A` — headlines accents, CTAs, key numbers, the "live" pulse
- **Amber / gold** `#FFB43D` — secondary highlights, gradients, chart accents
- **Near-black** `#0A0A0B` — page background (dark, premium, molten theme)
- **Off-white** `#F5F5F4` — body text on dark
- **Muted gray** `#8A8A8F` — captions, secondary text
- **Success green** `#22C55E` — only for on-chain "✓ confirmed" proof chips
- **Signature gradient:** radial/linear `#FF6A1A → #FFB43D`, like glowing magma. Use it sparingly for hero words and one hero shape per slide, never as full-slide wash.
- **Type:** display/headings = **Space Grotesk** (bold, tight tracking); body/UI = **Poppins**. Load via Google Fonts. Numbers big and confident.
- **Mood:** dark, molten, fintech-premium — think Stripe × a lava/heat aesthetic. Generous negative space, subtle grain or glow, no clip-art. Rounded 16–20px cards, soft orange shadows (`0 30px 80px -30px rgba(255,106,26,.25)`).

## Deck structure (14 slides — follow this content)
1. **Title** — "Magmos" wordmark, magma-glow. Subtitle "Payroll that arrives every second." Chips: *Built on HashKey Chain · Powered by Circle USDC · Track 1: UAE → Global remittances.*
2. **The problem** — Cross-border payroll & remittances are broken: **6–7% average fees**, **2–5 day** settlement, opaque FX, workers paid monthly in lump sums while bills are daily. The UAE→South-Asia/Africa corridor alone moves **$40B+/year**. Lead with 3 punchy stat cards.
3. **Who feels it** — Personas: the Dubai employer running global contractors; the Manila/Lagos/Karachi worker waiting weeks and losing a week's pay to fees. Make it human.
4. **The insight** — Money shouldn't arrive in lumps once a month; it should **stream by the second**, be **claimable instantly**, and **move across borders at USDC speed**. Stablecoins + a USDC-native chain finally make per-second payroll economical.
5. **Solution — Magmos** — The product in one line + the 4-verb loop as a visual: **Fund once → Stream forever → Claim anytime → Bridge home.** Show the molten "stream" flowing from a pool to recipients.
6. **How it works** — Simple architecture diagram: Employer funds **USDC pool** → Magmos **streaming engine** drips per-second → Worker **claims** to wallet → **CCTP** bridges to home chain → **offramp** to bank. Note idle treasury earns yield in a **USYC vault**.
7. **Product tour** — Grid of the real modules (each a small on-brand card, not lorem): **Streaming Payroll · Employees · Payment Links · Invoices · Billing & Subscriptions · Products/Commerce · Magmos AI · Developer suite (API keys, webhooks, SDK) · Offramp to bank.** Emphasize it's a full platform, not a toy.
8. **Live proof / demo** — "Not a mockup — **6 real on-chain transactions** on HashKey Chain testnet." Show a row of proof chips (Pool funded ✓, Stream started ✓, Invoice paid ✓, Treasury→yield ✓, Worker claimed ✓, Bridged home ✓) each with a truncated tx hash and a green ✓. Mention a 5-minute narrated demo video exists.
9. **Why Arc + Circle** — The unfair advantage: **USDC is the native gas token** (no volatile gas, sub-cent fees), **CCTP v2** for native cross-chain USDC, **Circle Wallets/passkeys** for onboarding, **instant finality**. Contrast a small "traditional rails vs Magmos on HashKey Chain" comparison (fee %, settlement time, transparency).
10. **Market** — TAM/SAM/SOM funnel: global remittances **~$860B/yr** (TAM) → digital/stablecoin-addressable corridors (SAM) → UAE→Global payroll beachhead (SOM). Clean concentric or funnel viz, real-feeling numbers, cite that stablecoin settlement volume now rivals major card networks.
11. **Business model** — How we make money: **0.5% streaming fee** on funds streamed + **SaaS tiers** for teams (invoicing, API, analytics) + **FX/offramp spread**. Show a simple unit-economics card.
12. **Traction & roadmap** — Now: working end-to-end product + live testnet txns + SDK/docs shipped (hackathon). Next 3 horizons: **Mainnet + first UAE SME pilots → CCTP multi-corridor + fiat offramp partners → payroll API platform / embedded payouts.** Horizontal timeline.
13. **Team** — Placeholder cards (Founder/Eng, Design, BD) with role + one-line strength; leave editable name slots. Small "built at the Circle hackathon" note.
14. **Close / ask** — Big magma headline: **"Payroll that arrives every second."** The ask (e.g. *raising a pre-seed / seeking pilot partners & Circle ecosystem support*). CTA + `github.com/nickthelegend/magmos`. End on the same glow as the title.

## Craft requirements
- Every slide: a clear **eyebrow label** (small caps, orange), one **dominant headline**, and tight supporting content. No wall-of-text.
- Use **real data visualizations** where noted (stat cards, funnel, comparison table, timeline, flow diagram) — build them in HTML/SVG/CSS, on-brand, animated in on slide-enter.
- Numbers are the hero: large Space Grotesk figures with small unit labels.
- Keyboard (←/→/space) + click nav + progress indicator. Slide counter. Fully responsive; looks great fullscreen on a 1920×1080 projector.
- Self-contained: inline all CSS/JS, Google Fonts via `<link>`, no external images — draw logos/shapes as SVG/gradients.
- Deliver as one artifact I can present directly and tweak text in.

Make it feel like a fundable, premium fintech story — confident, molten, and clean.
