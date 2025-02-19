import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../../store';
import { startStepperWithSteps } from '../../../../../data/actions/stepper';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import type { Step } from '../../../../../data/reducers/wallet/stepper';
import { ActionButton } from './ActionButton';
import type { BoostPromoEntity } from '../../../../../data/entities/promo';
import type { ChainEntity } from '../../../../../data/entities/chain';

type UnstakeProps = {
  boostId: BoostPromoEntity['id'];
  chainId: ChainEntity['id'];
  disabled?: boolean;
  canClaim: boolean;
};

export const Unstake = memo(function Claim({ boostId, chainId, disabled, canClaim }: UnstakeProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(
      startStepperWithSteps(
        [
          {
            step: 'boost-claim-unstake',
            message: t('Vault-TxnConfirm', {
              type: t(canClaim ? 'Claim-Unstake-noun' : 'Unstake-noun'),
            }),
            action: walletActions.exitBoost(boostId),
            pending: false,
          } satisfies Step,
        ],
        chainId
      )
    );
  }, [dispatch, boostId, chainId, t, canClaim]);

  return (
    <ActionButton disabled={disabled} onClick={handleClick}>
      {t(canClaim ? 'Boost-Button-Claim-Unstake' : 'Boost-Button-Unstake')}
    </ActionButton>
  );
});
