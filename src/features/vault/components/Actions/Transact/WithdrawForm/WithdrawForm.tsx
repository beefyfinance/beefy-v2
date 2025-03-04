import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectUserVaultBalanceInDepositTokenWithToken } from '../../../../../data/selectors/balance.ts';
import { errorToString } from '../../../../../../helpers/format.ts';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput/WithdrawTokenAmountInput.tsx';
import { WithdrawActions } from '../WithdrawActions/WithdrawActions.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { WithdrawnInWalletNotice } from '../WithdrawnInWalletNotice/WithdrawnInWalletNotice.tsx';
import { useDispatch } from 'react-redux';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';

const useStyles = legacyMakeStyles(styles);

const DepositedInVault = memo(function DepositedInVault() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const dispatch = useDispatch();
  const tokenAmount = useAppSelector(state =>
    vaultId ? selectUserVaultBalanceInDepositTokenWithToken(state, vaultId) : undefined
  );
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const handleMax = useCallback(() => {
    if (tokenAmount) {
      dispatch(
        transactActions.setInputAmount({
          index: 0,
          amount: tokenAmount.amount,
          max: true,
        })
      );
    }
  }, [dispatch, tokenAmount]);

  if (!vaultId || !tokenAmount) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return (
    <TokenAmountFromEntity
      onClick={forceSelection ? undefined : handleMax}
      amount={tokenAmount.amount}
      token={tokenAmount.token}
    />
  );
});

const WithdrawFormLoader = memo(function WithdrawFormLoader() {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <div className={classes.container}>
      {isLoading ? (
        <LoadingIndicator text={t('Transact-Loading')} />
      ) : isError ? (
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      ) : (
        <WithdrawForm />
      )}
    </div>
  );
});

export const WithdrawForm = memo(function WithdrawForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const i18key = useMemo(() => {
    return hasOptions
      ? forceSelection
        ? 'Transact-SelectToken'
        : 'Transact-SelectAmount'
      : 'Transact-Withdraw';
  }, [forceSelection, hasOptions]);

  return (
    <>
      <WithdrawnInWalletNotice css={styles.notice} />
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {hasOptions ? <img src={zapIcon} alt="Zap" height={12} /> : null}
          {t(i18key)}
        </div>
        <div className={classes.availableLabel}>
          {t('Transact-Available')}{' '}
          <span className={classes.availableLabelAmount}>
            <DepositedInVault />
          </span>
        </div>
      </div>
      <div className={classes.inputs}>
        <WithdrawTokenAmountInput />
      </div>
      <TransactQuote title={t('Transact-YouWithdraw')} css={styles.quote} />
      <div className={classes.actions}>
        <WithdrawActions />
      </div>
    </>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawFormLoader;
