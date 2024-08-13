import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store';
import { tenderlySimulateMerklClaim } from '../../../features/data/actions/tenderly';
import { TenderlyButton } from './TenderlyButton';
import type { ChainEntity } from '../../../features/data/entities/chain';

export type TenderlyMerklClaimButtonProps = {
  chainId: ChainEntity['id'];
  disabled?: boolean;
};

export const TenderlyMerklClaimButton = memo<TenderlyMerklClaimButtonProps>(
  function TenderlyMerklClaimButton({ chainId, disabled }) {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();
    const handleClick = useCallback(() => {
      dispatch(tenderlySimulateMerklClaim({ chainId, t }));
    }, [dispatch, t, chainId]);

    return <TenderlyButton chainId={chainId} onClick={handleClick} disabled={disabled} />;
  }
);
