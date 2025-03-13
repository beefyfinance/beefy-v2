import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store.ts';
import { tenderlySimulateStellaSwapClaim } from '../../../features/data/actions/tenderly.ts';
import { TenderlyButton } from './TenderlyButton.tsx';
import type { ChainEntity } from '../../../features/data/entities/chain.ts';
import type { VaultEntity } from '../../../features/data/entities/vault.ts';

export type TenderlyStellaSwapClaimButtonProps = {
  chainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  disabled?: boolean;
};

export const TenderlyStellaSwapClaimButton = memo(function TenderlyStellaSwapClaimButton({
  chainId,
  vaultId,
  disabled,
}: TenderlyStellaSwapClaimButtonProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    dispatch(tenderlySimulateStellaSwapClaim({ chainId, vaultId, t }));
  }, [dispatch, t, chainId, vaultId]);

  return <TenderlyButton chainId={chainId} onClick={handleClick} disabled={disabled} />;
});
