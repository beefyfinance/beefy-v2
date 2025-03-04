import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../store.ts';
import { tenderlySimulateMerklClaim } from '../../../features/data/actions/tenderly.ts';
import { TenderlyButton } from './TenderlyButton.tsx';
import type { ChainEntity } from '../../../features/data/entities/chain.ts';

export type TenderlyMerklClaimButtonProps = {
  chainId: ChainEntity['id'];
  disabled?: boolean;
};

export const TenderlyMerklClaimButton = memo(function TenderlyMerklClaimButton({
  chainId,
  disabled,
}: TenderlyMerklClaimButtonProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    dispatch(tenderlySimulateMerklClaim({ chainId, t }));
  }, [dispatch, t, chainId]);

  return <TenderlyButton chainId={chainId} onClick={handleClick} disabled={disabled} />;
});
