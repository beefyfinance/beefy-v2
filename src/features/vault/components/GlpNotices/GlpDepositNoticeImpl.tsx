import { memo, useCallback } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { getWeb3Instance } from '../../../data/apis/instances';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { ChainEntity } from '../../../data/entities/chain';
import { AbiItem } from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { GlpNotice } from './GlpNotice';
import { MultiCall } from 'eth-multicall';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet';

const StakedGlpAbi: AbiItem[] = [
  {
    inputs: [],
    name: 'glpManager',
    outputs: [
      {
        internalType: 'contract IGlpManager',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

const GlpManagerAbi: AbiItem[] = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'lastAddedAt',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cooldownDuration',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

async function getUnlockTime(
  depositTokenAddress: string,
  userAddress: string,
  chain: ChainEntity
): Promise<Date> {
  if (!userAddress) {
    return new Date(0);
  }

  const web3 = await getWeb3Instance(chain);
  const multicall = new MultiCall(web3, chain.multicallAddress);
  const stakedContract = new web3.eth.Contract(StakedGlpAbi, depositTokenAddress);
  const [[addresses]] = (await multicall.all([
    [
      {
        feeGlpTracker: stakedContract.methods.feeGlpTracker(),
        glpManager: stakedContract.methods.glpManager(),
        stakedGlpTracker: stakedContract.methods.stakedGlpTracker(),
      },
    ],
  ])) as [[{ feeGlpTracker: string; glpManager: string; stakedGlpTracker: string }]];

  const managerContract = new web3.eth.Contract(GlpManagerAbi, addresses.glpManager);
  const [[manager]] = (await multicall.all([
    [
      {
        lastAddedAt: managerContract.methods.lastAddedAt(userAddress),
        cooldownDuration: managerContract.methods.cooldownDuration(),
      },
    ],
  ])) as [[{ lastAddedAt: string; cooldownDuration: string }]];

  const lastAddedAt = new BigNumber(manager.lastAddedAt || '0').multipliedBy(1000).toNumber();
  const cooldownDuration = new BigNumber(manager.cooldownDuration || '0')
    .multipliedBy(1000)
    .toNumber();

  return new Date(lastAddedAt + cooldownDuration);
}

export type GlpDepositNoticeImplProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

export const GlpDepositNoticeImpl = memo<GlpDepositNoticeImplProps>(function GlpDepositNoticeImpl({
  vaultId,
  onChange,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const userAddress = useAppSelector(selectWalletAddressIfKnown);
  const depositTokenAddress = vault.depositTokenAddress;

  const fetchUnlockTime = useCallback(
    () => getUnlockTime(depositTokenAddress, userAddress, chain),
    [depositTokenAddress, userAddress, chain]
  );

  return (
    <GlpNotice
      noticeKey="Glp-Deposit-Notice"
      noticeKeyUnlocks="Glp-Deposit-Notice-Unlocks"
      onChange={onChange}
      fetchUnlockTime={fetchUnlockTime}
    />
  );
});
