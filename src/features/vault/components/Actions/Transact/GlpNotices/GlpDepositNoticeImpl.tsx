import { memo, useCallback } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { useAppSelector } from '../../../../../../store';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectChainById } from '../../../../../data/selectors/chains';
import { GlpNotice } from './GlpNotice';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet';
import { GlpLikeConfig } from './types';
import { getUnlockTime } from './GetUnlockTime';

export type GlpDepositNoticeImplProps = {
  vaultId: VaultEntity['id'];
  config: GlpLikeConfig;
  onChange: (isLocked: boolean) => void;
};

export const GlpDepositNoticeImpl = memo<GlpDepositNoticeImplProps>(function GlpDepositNoticeImpl({
  vaultId,
  config,
  onChange,
}) {
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
