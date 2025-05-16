import { memo, useCallback } from 'react';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet.ts';
import { getUnlockTime } from './GetUnlockTime.ts';
import { GlpNotice } from './GlpNotice.tsx';
import type { GlpLikeConfig } from './types.ts';

export type GlpDepositNoticeImplProps = {
  vaultId: VaultEntity['id'];
  config: GlpLikeConfig;
  onChange: (isLocked: boolean) => void;
};

export const GlpDepositNoticeImpl = memo(function GlpDepositNoticeImpl({
  vaultId,
  config,
  onChange,
}: GlpDepositNoticeImplProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const userAddress = useAppSelector(selectWalletAddressIfKnown);
  const depositTokenAddress = vault.depositTokenAddress;

  const fetchUnlockTime = useCallback(
    () => getUnlockTime(depositTokenAddress, userAddress, chain, config),
    [depositTokenAddress, userAddress, chain, config]
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
