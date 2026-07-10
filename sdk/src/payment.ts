import { erc20Abi } from "viem";
import { toRaw, type TokenConfig } from "./tokens";

// Build a wagmi `writeContract` request for a direct ERC-20 USDC transfer from
// the connected customer wallet to the merchant's receiving address on Arc.
// The <PayModal/> executes this with wagmi's useWriteContract.
export function buildPaymentRequest(opts: {
  token: TokenConfig;
  amount: number;
  recipient: string;
}) {
  const { token, amount, recipient } = opts;
  return {
    address: token.address,
    abi: erc20Abi,
    functionName: "transfer" as const,
    args: [recipient as `0x${string}`, toRaw(token, amount)] as const,
  };
}
