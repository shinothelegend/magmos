# Magmos demo recording (Synpress + real MetaMask)

Records a live product demo with **real MetaMask signature popups** on camera.
Synpress drives a real MetaMask in headed Chromium and clicks Confirm for you;
every transaction is real on HashKey Chain testnet (verifiable on arcscan).

> Runs **headed on your Mac** — MetaMask popups can't be captured headless.
> You just start a screen recording and watch it drive itself (~90s).

## One-time setup

```bash
cd magmos/demo-recording
npm install                      # already done
npx playwright install chromium  # browser binary, if not present

# Build the MetaMask cache: imports the HashKey Chain network + your funded deployer account.
# Get the key from magmos/contracts/.env.deployer (starts with 0x). It is only read
# from the env var — never written to disk here, never committed.
DEMO_PK=0x<your-deployer-private-key> npm run build:cache
```

Also make sure:
- The **org app is running**: `cd ../app && PORT=3100 bun dev`  (→ http://localhost:3100)
- The deployer wallet has **Arc gas** (native USDC) and some **test USDC** + an existing pool
  (it does from the earlier seed). Top-up needs ~100 USDC of headroom.

## Record

1. Start a screen recording (most reliable capture):
   - **QuickTime** → File → New Screen Recording → record the browser window, **or**
   - `./record.sh` (uses macOS `screencapture` for a fixed 100s clip → `demo.mov`)
2. In another terminal: `npm run record`
   - Chromium opens, connects MetaMask (**real Connect popup**), shows the streaming
     dashboard, tops up the pool with **two real signatures** (approve → deposit), then
     shows the updated pool.
3. Stop the recording. Playwright also drops a video/trace in `test-results/` if the
   persistent context supports it — check there too.

## Extend to the employee side (claim + CCTP send-home)

The org flow is wired in `tests/demo.spec.ts`. To add the recipient side:
1. In `wallet-setup/deployer.setup.ts`, also
   `await metamask.importWalletFromPrivateKey(<recipient key from scripts/.demo-wallets.json>)`
   and rebuild the cache.
2. In the spec, `await metamask.switchAccount(...)`, drive `http://localhost:3001`
   (claim → send-home) the same way, confirming each popup.

## If something needs a tweak

Untested against a live headed MetaMask here, so expect small adjustments on your Mac:
- **Selectors**: the top-up button / amount field use text/role locators — adjust in the spec if the DOM differs.
- **MetaMask method**: if the approve step isn't a spending-cap screen, `approveTokenPermission()`
  falls back to `confirmTransaction()` automatically; swap if needed.
- **Timing**: bump the `waitForTimeout`s if Arc is slow.
- Run `npm run record:ui` (Playwright UI mode) to step through and see where it stops.
