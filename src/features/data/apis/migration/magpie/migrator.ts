import type { Migrator } from '../migration-types';
import type { VaultEntity } from '../../../entities/vault';
import type { BigNumber } from 'bignumber.js';
import type { BeefyState } from '../../../../../redux-types';
import { selectTokenByAddress } from '../../../selectors/tokens';
import { toWei } from '../../../../../helpers/big-number';
import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import { buildExecute, buildFetchBalance } from '../utils';

const id = 'magpie';

const poolHelpers = {
  ethereum: '0x1C1Fb35334290b5ff1bF7B4c09130885b10Fc0f4',
  arbitrum: '0xc06a5d3014b9124Bf215287980305Af2f793eB30',
};

async function getBalance(
  vault: VaultEntity,
  web3: Web3,
  walletAddress: string,
  _: BeefyState
): Promise<string> {
  const poolHelper = poolHelpers[vault.chainId];
  if (!poolHelper) return '0';
  return new web3.eth.Contract(PoolHelperAbi, poolHelper).methods
    .balance(vault.depositTokenAddress, walletAddress)
    .call();
}

async function unstakeCall(vault: VaultEntity, web3: Web3, amount: BigNumber, state: BeefyState) {
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const amountInWei = toWei(amount, depositToken.decimals);
  const poolHelper = poolHelpers[vault.chainId];
  if (!poolHelper) return;
  return new web3.eth.Contract(PoolHelperAbi, poolHelper).methods.withdrawMarketWithClaim(
    vault.depositTokenAddress,
    amountInWei.toString(10),
    true
  );
}

const PoolHelperAbi: AbiItem[] = [
  {
    inputs: [
      { internalType: 'address', name: '_market', type: 'address' },
      { internalType: 'address', name: '_address', type: 'address' },
    ],
    name: 'balance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_market', type: 'address' },
      { internalType: 'uint256', name: '_amount', type: 'uint256' },
      { internalType: 'bool', name: '_doClaim', type: 'bool' },
    ],
    name: 'withdrawMarketWithClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const migrator: Migrator = {
  update: buildFetchBalance(id, getBalance),
  execute: buildExecute(id, unstakeCall),
};
