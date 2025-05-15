import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { startUnstakeBoostSteps } from '../../../../../data/actions/wallet/boost.ts';
import { ActionInputButton, type ActionInputButtonProps } from './ActionInputButton.tsx';
import type { StakeInputProps } from './StakeInput.tsx';

type UnstakeInputProps = StakeInputProps;

export const UnstakeInput = memo(function UnstakeInput({
  boostId,
  balance,
  open,
  toggleOpen,
}: UnstakeInputProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleUnstake = useCallback<ActionInputButtonProps['onSubmit']>(
    (amount, max) => {
      dispatch(startUnstakeBoostSteps(boostId, t, amount, max));
    },
    [t, boostId, dispatch]
  );
  const handleToggle = useCallback(() => {
    toggleOpen('unstake');
  }, [toggleOpen]);

  return (
    <ActionInputButton
      boostId={boostId}
      open={open === 'unstake'}
      onToggle={handleToggle}
      onSubmit={handleUnstake}
      balance={balance}
      title={t('Boost-Button-Unstake')}
      balanceLabel={t('Available')}
      buttonLabel={t('Boost-Button-Unstake')}
      buttonVariant="default"
    />
  );
});
