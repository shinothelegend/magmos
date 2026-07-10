import { readFileSync } from 'node:fs';
import { createWalletClient, defineChain, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
const pk = readFileSync('/Volumes/Extreme SSD/Projects/arc/magmos/contracts/.env.deployer','utf8').match(/DEPLOYER_PRIVATE_KEY=\s*(0x[0-9a-fA-F]+)/)[1];
const arc = defineChain({ id:5042002, name:'Arc', nativeCurrency:{name:'USDC',symbol:'USDC',decimals:18}, rpcUrls:{default:{http:['https://rpc.testnet.arc.network']}} });
const wallet = createWalletClient({ account: privateKeyToAccount(pk), chain: arc, transport: http() });
const hash = await wallet.sendTransaction({ to:'0xBa1F74A9E6858D75924e180211acA830E0b49485', value: parseEther('0.5') });
console.log('funded Maya 0.5 gas ->', hash);
await new Promise(r=>setTimeout(r,5000));
