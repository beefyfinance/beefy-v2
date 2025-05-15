import type BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { startStakeBoostSteps } from '../../../../../data/actions/wallet/boost.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import { ActionInputButton, type ActionInputButtonProps } from './ActionInputButton.tsx';

export type StakeInputProps = {
  boostId: BoostPromoEntity['id'];
  balance: BigNumber;
  open: string | undefined;
  toggleOpen: (mode: 'stake' | 'unstake') => void;
};

export const StakeInput = memo(function StakeInput({
  boostId,
  balance,
  open,
  toggleOpen,
}: StakeInputProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleStake = useCallback<ActionInputButtonProps['onSubmit']>(
    amount => {
      dispatch(startStakeBoostSteps(boostId, t, amount));
    },
    [t, boostId, dispatch]
  );
  const handleToggle = useCallback(() => {
    toggleOpen('stake');
  }, [toggleOpen]);

  return (
    <ActionInputButton
      boostId={boostId}
      open={open === 'stake'}
      onToggle={handleToggle}
      onSubmit={handleStake}
      balance={balance}
      title={t('Boost-Button-Stake')}
      balanceLabel={t('Available')}
      buttonLabel={t('Boost-Button-Stake')}
    />
  );
});
