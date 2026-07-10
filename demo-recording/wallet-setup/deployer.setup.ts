import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

// Synpress builds a reusable MetaMask cache from this file:  `npm run build:cache`
// It initializes MetaMask with a throwaway seed, adds the Arc testnet, and imports
// your FUNDED deployer/org account from a private key supplied via env.
//
//   DEMO_PK=0x<deployer-private-key> npm run build:cache
//
// The key is read from the environment and never written to disk here. Get it from
// magmos/contracts/.env.deployer (it is gitignored — keep it that way).

const PASSWORD = 'Tester@1234'
// Standard throwaway HD seed — only used to bootstrap MetaMask; the demo uses the
// imported deployer account below, not this seed.
const SEED = 'test test test test test test test test test test test junk'
const DEMO_PK = process.env.DEMO_PK

export const walletPassword = PASSWORD

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  await metamask.importWallet(SEED)

  // Add Arc testnet (chainId 5042002; USDC is the native gas token).
  await metamask.addNetwork({
    name: 'Arc Testnet',
    rpcUrl: 'https://rpc.testnet.arc.network',
    chainId: 5042002,
    symbol: 'USDC',
    blockExplorerUrl: 'https://testnet.arcscan.app',
  })

  // Import the funded deployer (org) account — this is the wallet the demo signs with.
  if (DEMO_PK) {
    await metamask.importWalletFromPrivateKey(DEMO_PK)
  } else {
    console.warn(
      '\n[wallet-setup] DEMO_PK not set — MetaMask has only the throwaway account.\n' +
        'Re-run with:  DEMO_PK=0x<deployer-key> npm run build:cache\n'
    )
  }
})
