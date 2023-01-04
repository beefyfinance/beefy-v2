import { memo, useCallback } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById, selectVaultStrategyAddress } from '../../../../../data/selectors/vaults';
import { selectChainById } from '../../../../../data/selectors/chains';
import { GlpNotice } from './GlpNotice';
import { GlpLikeConfig } from './types';
import { getUnlockTime } from './GetUnlockTime';

export type GlpWithdrawNoticeImplProps = {
  vaultId: VaultEntity['id'];
  config: GlpLikeConfig;
  onChange: (isLocked: boolean) => void;
};

export const GlpWithdrawNoticeImpl = memo<GlpWithdrawNoticeImplProps>(
  function GlpWithdrawNoticeImpl({ vaultId, config, onChange }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const strategyAddress = useAppSelector(state => selectVaultStrategyAddress(state, vault.id));
    const depositTokenAddress = vault.depositTokenAddress;

    const fetchUnlockTime = useCallback(
      () => getUnlockTime(depositTokenAddress, strategyAddress, chain, config),
      [strategyAddress, depositTokenAddress, chain, config]
    );

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
