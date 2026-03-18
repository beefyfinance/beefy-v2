/**
 * Fetches the fee() from the CircleBeefyZapReceiver contract on each CCTP chain,
 * formats the value using USDC decimals from the addressbook, and updates beefyBridgeFeeUsd in cctp-config.ts.
 *
 * Run: npx tsx scripts/updateCctpBridgeFees.ts
 */

import { getContract, type Address } from 'viem';
import { addressBook } from '@beefyfinance/blockchain-addressbook';
import { getViemClient } from './common/viem.ts';
import { appToAddressBookId } from './common/config.ts';
import type { AppChainId } from './common/chains.ts';
import { loadString, saveString } from './common/files.ts';
import { CCTP_CONFIG } from '../src/config/cctp/cctp-config.ts';

const receiverFeeAbi = [
  {
    inputs: [],
    name: 'fee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

function getUsdcDecimals(chainId: AppChainId): number {
  const addressbookChainId = appToAddressBookId(chainId);
  const chainConfig = CCTP_CONFIG.chains[chainId];
  if (!chainConfig) return 6;
  const usdcAddressLower = chainConfig.usdcAddress.toLowerCase();
  const tokens = addressBook[addressbookChainId]?.tokens;
  if (!tokens) return 6;
  const usdcToken = Object.values(tokens).find(t => t.address?.toLowerCase() === usdcAddressLower);
  return usdcToken?.decimals ?? 6;
}

async function fetchFeeUsd(chainId: AppChainId): Promise<{ feeUsd: number; feeRaw: string }> {
  const chainConfig = CCTP_CONFIG.chains[chainId];
  if (!chainConfig) throw new Error(`No CCTP config for chain ${chainId}`);
  const receiverAddress = chainConfig.receiver as Address;
  const usdcDecimals = getUsdcDecimals(chainId);

  const client = getViemClient(chainId);
  const contract = getContract({
    abi: receiverFeeAbi,
    address: receiverAddress,
    client,
  });
  const feeRaw = await contract.read.fee();
  const feeUsd = Number(feeRaw) / 10 ** usdcDecimals;

  const formatted = Math.round(feeUsd * 100) / 100;

  return { feeUsd: formatted, feeRaw: feeRaw.toString() };
}

async function main() {
  const chainIds = Object.keys(CCTP_CONFIG.chains) as AppChainId[];
  const results: Record<string, number> = {};

  console.log('Fetching receiver fee() from each CCTP chain...\n');

  for (const chainId of chainIds) {
    try {
      const { feeUsd, feeRaw } = await fetchFeeUsd(chainId);
      results[chainId] = feeUsd;
      console.log(`  ${chainId}: formatted:${feeUsd} , raw:${feeRaw}`);
    } catch (err) {
      console.error(`  ${chainId}: failed -`, err);
      throw err;
    }
  }

  const configPath = 'src/config/cctp/cctp-config.ts';
  let content = await loadString(configPath);

  for (const chainId of chainIds) {
    const value = results[chainId];
    if (value == null) continue;
    const regex = new RegExp(`(${chainId}: \\{[\\s\\S]*?beefyBridgeFeeUsd: )[\\d.]+`, 'm');
    content = content.replace(regex, `$1${value}`);
  }

  await saveString(configPath, content);
  console.log('\nUpdated src/config/cctp/cctp-config.ts with new beefyBridgeFeeUsd values.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
