import { memo, useCallback } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { getWeb3Instance } from '../../../../../data/apis/instances';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById, selectVaultStrategyAddress } from '../../../../../data/selectors/vaults';
import { selectChainById } from '../../../../../data/selectors/chains';
import { ChainEntity } from '../../../../../data/entities/chain';
import { AbiItem } from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { GlpNotice } from './GlpNotice';

const strategyABI: AbiItem[] = [
  {
    inputs: [],
    name: 'withdrawOpen',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function getUnlockTime(strategyAddress: string, chain: ChainEntity) {
  const web3 = await getWeb3Instance(chain);
  const strategyContract = new web3.eth.Contract(strategyABI, strategyAddress);
  const withdrawOpen = await strategyContract.methods.withdrawOpen().call();
  const timestamp = new BigNumber(withdrawOpen || '0').multipliedBy(1000).toNumber();
  return new Date(timestamp);
}

export type GlpWithdrawNoticeImplProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};

export const GlpWithdrawNoticeImpl = memo<GlpWithdrawNoticeImplProps>(
  function GlpWithdrawNoticeImpl({ vaultId, onChange }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const strategyAddress = useAppSelector(state => selectVaultStrategyAddress(state, vault.id));

    const fetchUnlockTime = useCallback(() => {
      return getUnlockTime(strategyAddress, chain);
    }, [strategyAddress, chain]);

    return (
      <GlpNotice
        noticeKey="Glp-Withdraw-Notice"
        noticeKeyUnlocks="Glp-Withdraw-Notice-Unlocks"
        onChange={onChange}
        fetchUnlockTime={fetchUnlockTime}
      />
    );
  }
);
