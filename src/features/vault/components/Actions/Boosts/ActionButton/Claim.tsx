import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../data/actions/wallet/stepper.ts';
import { claimBoost } from '../../../../../data/actions/wallet/boost.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import type { Step } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { selectTransactExecuting } from '../../../../../data/selectors/transact.ts';
import { ActionButton } from './ActionButton.tsx';

type ClaimProps = {
  boostId: BoostPromoEntity['id'];
  chainId: ChainEntity['id'];
  disabled?: boolean;
};

export const Claim = memo(function Claim({ boostId, chainId, disabled }: ClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isExecuting = useAppSelector(selectTransactExecuting);
  const handleClick = useCallback(() => {
    dispatch(
      stepperStartWithSteps(
        [
          {
            step: 'boost-claim',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: claimBoost(boostId),
            pending: false,
          } satisfies Step,
        ],
        chainId
      )
    );
  }, [dispatch, boostId, chainId, t]);

  return (
    <ActionButton disabled={disabled || isExecuting} onClick={handleClick} variant={'cta'}>
      {t('Boost-Button-Claim')}
    </ActionButton>
  );
});
