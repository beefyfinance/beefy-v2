import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { stepperStartWithSteps } from '../../../../../data/actions/wallet/stepper.ts';
import { exitBoost } from '../../../../../data/actions/wallet/boost.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import type { BoostPromoEntity } from '../../../../../data/entities/promo.ts';
import type { Step } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { ActionButton } from './ActionButton.tsx';

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
      stepperStartWithSteps(
        [
          {
            step: 'boost-claim-unstake',
            message: t('Vault-TxnConfirm', {
              type: t(canClaim ? 'Claim-Unstake-noun' : 'Unstake-noun'),
            }),
            action: exitBoost(boostId),
            pending: false,
          } satisfies Step,
        ],
        chainId
      )
    );
  }, [dispatch, boostId, chainId, t, canClaim]);

  return (
    <ActionButton disabled={disabled} onClick={handleClick} variant={'default'}>
      {t(canClaim ? 'Boost-Button-Claim-Unstake' : 'Boost-Button-Unstake')}
    </ActionButton>
  );
});
