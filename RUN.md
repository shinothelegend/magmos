# Running Magmos locally

Two Next.js apps + live contracts on HashKey Chain testnet.

## 0. One-time wallet setup (MetaMask)
Add **HashKey Chain Testnet**:
- Network name: `HashKey Chain Testnet`
- RPC: `https://hashkey-chain-testnet.rpc.thirdweb.com`
- Chain ID: `133`
- Currency symbol: `HSK`
- Explorer: `https://testnet-explorer.hsk.xyz`

Then get **gas** (native HSK): https://faucet.hsk.xyz → paste your address.

## 1. Deploy Contracts
If you haven't deployed the contracts yet, do so using Foundry:
```bash
cd contracts
# Ensure you have HSK on the deployer account
export DEPLOYER_PRIVATE_KEY="your-private-key"
forge script script/Deploy.s.sol:Deploy --rpc-url hashkey_testnet --broadcast -vvv
```
Take the output addresses from `contracts/deployments/hashkey-testnet.json` and update the constants in `app/lib/magmos.ts` and `employee/src/lib/magmos.ts`.

## 2. Org app (sender dashboard) — port 3100
```bash
cd "app"
npm install         # first time
PORT=3100 npm run dev   # → http://localhost:3100
```

## 3. Recipient app (claim + send home) — port 3001
```bash
cd "employee"
npm install         # first time
npm run dev -- --port 3001 # → http://localhost:3001
```

## 4. Get test USDC (the faucet you asked for)
Open **http://localhost:3100/faucet** → connect wallet → **Get 10,000 test USDC**.
(This mints `MagmosUSDC`, a 6-dec faucet token = the payroll rail.)

## 5. Demo flow
1. **Org** (localhost:3100): connect → onboarding (org name) → dashboard → **Fund payroll**:
   add recipients (address + name + monthly USDC) → approve USDC → stream. Streams start ticking.
2. **Recipient** (localhost:3001): connect with a recipient wallet → watch the **live per-second
   ticker** → **Claim** → USDC lands in the wallet → **Send home** (mocked CCTP bridge to another chain).
