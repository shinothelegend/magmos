#!/usr/bin/env bash
# Magmos demo seeder — creates the Track-1 demo in one command:
#   "Falcon Marketplace FZ-LLC" (UAE) streaming USDC to creators in Manila, Lagos, Karachi.
# - names → Mongo via the org app's /api (EIP-191 signed with the deployer key)
# - streams → on-chain via MagmosPayroll.deposit (approve + deposit)
# - recipient keys saved to scripts/.demo-wallets.json (GITIGNORED) so you can import one
#   into MetaMask and demo the recipient portal / claim.
# Requirements: org app running on http://localhost:3000, foundry (cast), jq.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/contracts/.env.deployer"
RPC="https://rpc.testnet.arc.network"
PAYROLL="0xc810cabdCb4b22df29A54bdb0E124EE3ABA46093"
TUSDC="0x3248CcD4c276b4785f81f8c1207094262F67a33C"
API="${MAGMOS_API:-http://localhost:3100}"   # org app (see RUN.md — Magmos runs on 3100/3001)
SKIP_CHAIN="${SKIP_CHAIN:-0}"                # SKIP_CHAIN=1 → only (re)write org+names via the API
MONTH_S=2592000

# sanity: make sure the API is actually the Magmos org app, not another project on the port
if ! curl -sf "$API/api/orgs/0x0000000000000000000000000000000000000001" -o /dev/null -w "" 2>/dev/null; then
  # 404-with-JSON is fine (route exists); connection refused / HTML 404 page is not.
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/orgs/0x0000000000000000000000000000000000000001" || echo "000")
  if [ "$CODE" != "404" ] && [ "$CODE" != "200" ]; then
    echo "✗ $API does not look like the Magmos org app (HTTP $CODE). Start it: cd app && PORT=3100 bun dev"; exit 1
  fi
fi

[ -f "$ENV_FILE" ] || { echo "missing $ENV_FILE"; exit 1; }
export $(grep -v '^#' "$ENV_FILE" | xargs)
ORG="$DEPLOYER_ADDRESS"; PK="$DEPLOYER_PRIVATE_KEY"

# ---- demo recipients (name, city, monthly USDC) ----
NAMES=("Maya Santos — Manila" "Amara Diallo — Lagos" "Hassan Raza — Karachi")
SALARIES=(2400 3200 1600)     # human USDC / month
TOTAL_RAW=7200000000          # sum * 1e6

WALLETS_FILE="$ROOT/scripts/.demo-wallets.json"
if [ ! -f "$WALLETS_FILE" ]; then
  echo "→ generating 3 demo recipient wallets"
  TMP="[]"
  for i in 0 1 2; do
    OUT=$(cast wallet new)
    ADDR=$(echo "$OUT" | grep -i '^Address' | awk '{print $NF}')
    KEY=$(echo "$OUT" | grep -i 'Private key' | awk '{print $NF}')
    TMP=$(echo "$TMP" | jq --arg n "${NAMES[$i]}" --arg a "$ADDR" --arg k "$KEY" --argjson s "${SALARIES[$i]}" \
      '. + [{name:$n, address:$a, privateKey:$k, monthlyUsdc:$s}]')
  done
  echo "$TMP" > "$WALLETS_FILE"; chmod 600 "$WALLETS_FILE"
fi
ADDRS=($(jq -r '.[].address' "$WALLETS_FILE"))
echo "→ recipients: ${ADDRS[*]}"

# ---- EIP-191 auth headers (magmos-auth:<lowercased addr>:<unixMs>) ----
NOW_MS=$(($(date +%s) * 1000))
ORG_LC=$(echo "$ORG" | tr '[:upper:]' '[:lower:]')
MSG="magmos-auth:${ORG_LC}:${NOW_MS}"
SIG=$(cast wallet sign --private-key "$PK" "$MSG")
AUTH=(-H "x-magmos-address: $ORG" -H "x-magmos-message: $MSG" -H "x-magmos-signature: $SIG" -H "content-type: application/json")

echo "→ upserting org profile"
curl -sf -X POST "$API/api/orgs/$ORG" "${AUTH[@]}" \
  -d '{"name":"Falcon Marketplace FZ-LLC"}' >/dev/null || { echo "✗ org upsert FAILED"; exit 1; }
echo "  org ok"

echo "→ saving recipient names"
BULK=$(jq -c '{employees: [.[] | {walletAddress: .address, name: .name, monthlyUsdc: .monthlyUsdc}]}' "$WALLETS_FILE")
curl -sf -X POST "$API/api/orgs/$ORG/employees/bulk" "${AUTH[@]}" -d "$BULK" | jq -c . \
  || { echo "✗ bulk names FAILED"; exit 1; }

if [ "$SKIP_CHAIN" = "1" ]; then
  echo "✅ names-only seed done (SKIP_CHAIN=1) — streams unchanged."
  exit 0
fi

# ---- on-chain: ensure balance, approve, deposit + start 3 streams ----
BAL=$(cast call "$TUSDC" "balanceOf(address)(uint256)" "$ORG" --rpc-url "$RPC" | awk '{print $1}')
if [ "$BAL" -lt "$TOTAL_RAW" ]; then
  echo "→ balance low ($BAL) — minting 10,000 from faucet"
  cast send "$TUSDC" "faucet()" --rpc-url "$RPC" --private-key "$PK" >/dev/null
fi

echo "→ approving $((TOTAL_RAW / 1000000)) USDC"
cast send "$TUSDC" "approve(address,uint256)" "$PAYROLL" "$TOTAL_RAW" --rpc-url "$RPC" --private-key "$PK" >/dev/null

POOLID=$(cast call "$PAYROLL" "poolIdFor(address,address)(bytes32)" "$ORG" "$TUSDC" --rpc-url "$RPC")
EXISTS=$(cast call "$PAYROLL" "getPool(bytes32)(address,address,uint256,uint256,uint256,bool)" "$POOLID" --rpc-url "$RPC" | tail -1)
EMP_ARR="[${ADDRS[0]},${ADDRS[1]},${ADDRS[2]}]"
RATE_ARR="[2400000000,3200000000,1600000000]"
PERIOD_ARR="[$MONTH_S,$MONTH_S,$MONTH_S]"

echo "→ funding + starting 3 streams (pool exists: $EXISTS)"
if [ "$EXISTS" = "true" ]; then
  TX=$(cast send "$PAYROLL" "deposit(bytes32,uint256,address[],uint256[],uint256[])" \
    "$POOLID" "$TOTAL_RAW" "$EMP_ARR" "$RATE_ARR" "$PERIOD_ARR" \
    --rpc-url "$RPC" --private-key "$PK" --json | jq -r .transactionHash)
else
  TX=$(cast send "$PAYROLL" "createPoolAndDeposit(address,uint256,address[],uint256[],uint256[])" \
    "$TUSDC" "$TOTAL_RAW" "$EMP_ARR" "$RATE_ARR" "$PERIOD_ARR" \
    --rpc-url "$RPC" --private-key "$PK" --json | jq -r .transactionHash)
fi
echo "  tx: https://testnet.arcscan.app/tx/$TX"

echo ""
echo "✅ Demo seeded — open http://localhost:3000/dashboard (org) to watch 3 live streams."
echo "   Recipient demo: import a key from scripts/.demo-wallets.json into MetaMask,"
echo "   then open http://localhost:3001 to see the live ticker + claim."