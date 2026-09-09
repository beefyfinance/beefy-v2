import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { transactSetUnstakeFromBoost } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactExecuting,
  selectTransactUnstakeFromBoost,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';
import { StakedTokenAmount } from './StakedTokenAmount.tsx';

export type UnstakeBoostNoticeProps = {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
};

const UnstakeBoostNotice = memo(function UnstakeBoostNotice({
  vaultId,
  balance,
}: UnstakeBoostNoticeProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const checked = useAppSelector(selectTransactUnstakeFromBoost);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const isStepping = useAppSelector(selectIsStepperStepping);

  const handleToggle = useCallback(() => {
    dispatch(transactSetUnstakeFromBoost(!checked));
  }, [dispatch, checked]);

  const heading = useMemo(
    () => (
      <Trans
        t={t}
        i18nKey="Transact-Notice-Withdraw-Boost-Staked"
        components={{ Token: <StakedTokenAmount vaultId={vaultId} amount={balance} /> }}
      />
    ),
    [t, vaultId, balance]
  );

  return (
    <ActionTokensNotice
      onClick={handleToggle}
      checked={checked}
      disabled={isExecuting || isStepping}
      heading={heading}
    >
      {t('Transact-Notice-Withdraw-Boost-ClaimUnstake')}
    </ActionTokensNotice>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default UnstakeBoostNotice;
