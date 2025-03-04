import { memo, useCallback } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { GlpNotice } from './GlpNotice.tsx';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet.ts';
import type { GlpLikeConfig } from './types.ts';
import { getUnlockTime } from './GetUnlockTime.ts';

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
