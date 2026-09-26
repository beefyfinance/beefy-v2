import type BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../../data/store/hooks.ts';
import { transactSwitchMode } from '../../../../../data/actions/transact.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import { ActionTokensNotice } from './ActionTokensNotice.tsx';
import { StakedTokenAmount } from './StakedTokenAmount.tsx';

type WithdrawBoostNoticeProps = {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
};

const WithdrawBoostNotice = memo(function WithdrawBoostNotice({
  vaultId,
  balance,
}: WithdrawBoostNoticeProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const inner = useMemo(
    () => (
      <Trans
        t={t}
        i18nKey="Transact-Notice-Withdraw-Boost"
        components={{ Token: <StakedTokenAmount vaultId={vaultId} amount={balance} /> }}
      />
    ),
    [t, vaultId, balance]
  );
  const handleTab = useCallback(() => {
    dispatch(transactSwitchMode(TransactMode.Boost));
  }, [dispatch]);

  return <ActionTokensNotice onClick={handleTab}>{inner}</ActionTokensNotice>;
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawBoostNotice;
