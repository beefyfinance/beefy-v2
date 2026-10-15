import type BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { transactSetWithBoost } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  selectTransactIsLocked,
  selectTransactWithBoost,
} from '../../../../../data/selectors/transact.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';
import { StakedTokenAmount } from './StakedTokenAmount.tsx';

export type UnstakeBoostNoticeProps = {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  /** the withdraw claims the boost's pending rewards first */
  claim: boolean;
};

const UnstakeBoostNotice = memo(function UnstakeBoostNotice({
  vaultId,
  balance,
  claim,
}: UnstakeBoostNoticeProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const checked = useAppSelector(selectTransactWithBoost);
  const locked = useAppSelector(selectTransactIsLocked);

  const handleToggle = useCallback(() => {
    dispatch(transactSetWithBoost(!checked));
  }, [dispatch, checked]);

  return (
    <ActionTokensNotice onClick={handleToggle} checked={checked} disabled={locked}>
      <Trans
        t={t}
        i18nKey={
          claim ?
            'Transact-Notice-Withdraw-Boost-Unstake-Claim'
          : 'Transact-Notice-Withdraw-Boost-Unstake'
        }
        components={{ Token: <StakedTokenAmount vaultId={vaultId} amount={balance} /> }}
      />
    </ActionTokensNotice>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default UnstakeBoostNotice;
