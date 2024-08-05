import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store';
import { tenderlySimulateStellaSwapClaim } from '../../../features/data/actions/tenderly';
import { TenderlyButton } from './TenderlyButton';
import type { ChainEntity } from '../../../features/data/entities/chain';
import type { VaultEntity } from '../../../features/data/entities/vault';

export type TenderlyStellaSwapClaimButtonProps = {
  chainId: ChainEntity['id'];
  vaultId: VaultEntity['id'];
  disabled?: boolean;
};

export const TenderlyStellaSwapClaimButton = memo<TenderlyStellaSwapClaimButtonProps>(
  function TenderlyStellaSwapClaimButton({ chainId, vaultId, disabled }) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const handleClick = useCallback(() => {
      dispatch(tenderlySimulateStellaSwapClaim({ chainId, vaultId, t }));
    }, [dispatch, t, chainId, vaultId]);

    return <TenderlyButton chainId={chainId} onClick={handleClick} disabled={disabled} />;
  }
);
