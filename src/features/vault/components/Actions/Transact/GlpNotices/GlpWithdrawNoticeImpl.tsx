import { memo, useCallback } from 'react';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import {
  selectVaultById,
  selectVaultStrategyAddress,
} from '../../../../../data/selectors/vaults.ts';
import { getUnlockTime } from './GetUnlockTime.ts';
import { GlpNotice } from './GlpNotice.tsx';
import type { GlpLikeConfig } from './types.ts';

export type GlpWithdrawNoticeImplProps = {
  vaultId: VaultEntity['id'];
  config: GlpLikeConfig;
  onChange: (isLocked: boolean) => void;
};

export const GlpWithdrawNoticeImpl = memo(function GlpWithdrawNoticeImpl({
  vaultId,
  config,
  onChange,
}: GlpWithdrawNoticeImplProps) {
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
});
