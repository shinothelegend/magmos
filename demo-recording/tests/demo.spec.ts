import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import setup, { walletPassword } from '../wallet-setup/deployer.setup'

// Synpress wires a real MetaMask into a headed Chromium. Each signing step below
// pops the real MetaMask dialog and Synpress clicks Confirm — on camera.
const test = testWithSynpress(metaMaskFixtures(setup))

const ORG = 'http://localhost:3100'

test('Magmos demo — fund real-time payroll on HashKey Chain (real signatures)', async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  const metamask = new MetaMask(context, metamaskPage, walletPassword, extensionId)

  // Make sure MetaMask is on HashKey Chain and using the funded deployer account.
  await metamask.switchNetwork('Arc Testnet').catch(() => {})

  // ── 1. Land + connect ────────────────────────────────────────────────────
  await page.goto(`${ORG}/`)
  await page.waitForTimeout(1500)
  await page.getByText('Launch Dashboard', { exact: false }).first().click()
  // Real MetaMask "Connect" popup → approve.
  await metamask.connectToDapp()
  // If the app requests a network switch, approve it (no-op if already on HashKey Chain).
  await metamask.approveSwitchNetwork().catch(() => {})
  await page.waitForTimeout(3000)

  // ── 2. Show the live dashboard (streaming) ───────────────────────────────
  await page.goto(`${ORG}/dashboard`)
  await page.waitForTimeout(6000) // let the live tickers stream on camera

  // ── 3. Top up the payroll pool — two REAL signatures (approve → deposit) ──
  await page.goto(`${ORG}/dashboard/payments`)
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: /top up/i }).first().click()
  await page.waitForTimeout(800)
  await page.getByPlaceholder('0.00').fill('100')
  await page.getByRole('button', { name: /approve.*top up|approve & top up|confirm/i }).click()

  // Popup #1 — approve USDC spend. (If MetaMask shows a spending-cap screen,
  // approveTokenPermission handles it; otherwise confirmTransaction does.)
  await metamask.approveTokenPermission().catch(async () => {
    await metamask.confirmTransaction()
  })
  await page.waitForTimeout(4000)

  // Popup #2 — the top-up deposit.
  await metamask.confirmTransaction()
  await page.waitForTimeout(6000)

  // ── 4. Back to the overview to show the updated, still-streaming pool ─────
  await page.goto(`${ORG}/dashboard`)
  await page.waitForTimeout(7000)

  // NOTE: The employee side (claim + CCTP send-home on :3001) is a natural
  // follow-on. It needs a RECIPIENT account imported too — add a second
  // `metamask.importWalletFromPrivateKey(<recipient-key from scripts/.demo-wallets.json>)`
  // in the wallet-setup, switch to it here, then drive :3001 claim/send-home the
  // same way. Left out by default so the first take is simple and reliable.
})
