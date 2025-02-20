import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../../store';
import { startStepperWithSteps } from '../../../../../data/actions/stepper';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import type { Step } from '../../../../../data/reducers/wallet/stepper';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { ActionButton } from './ActionButton';

type ClaimProps = {
  boostId: BoostPromoEntity['id'];
  chainId: ChainEntity['id'];
  disabled?: boolean;
};

export const Claim = memo(function Claim({ boostId, chainId, disabled }: ClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(
      startStepperWithSteps(
        [
          {
            step: 'boost-claim',
            message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
            action: walletActions.claimBoost(boostId),
            pending: false,
          } satisfies Step,
        ],
        chainId
      )
    );
  }, [dispatch, boostId, chainId, t]);

  return (
    <ActionButton disabled={disabled} onClick={handleClick}>
      {t('Boost-Button-Claim')}
    </ActionButton>
  );
});
