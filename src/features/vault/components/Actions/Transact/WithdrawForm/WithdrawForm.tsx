import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { errorToString } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectUserVaultBalanceInDepositTokenWithToken } from '../../../../../data/selectors/balance.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { Actions } from '../Actions/Actions.tsx';
import { FormFooter } from '../FormFooter/FormFooter.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { WithdrawActions } from '../WithdrawActions/WithdrawActions.tsx';
import { WithdrawnInWalletNotice } from '../WithdrawnInWalletNotice/WithdrawnInWalletNotice.tsx';
import { WithdrawQueueLoader } from '../WithdrawQueue/WithdrawQueueLoader.tsx';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput/WithdrawTokenAmountInput.tsx';
import { styles } from './styles.ts';

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
        transactSetInputAmount({
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
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <Container>
      {isLoading ?
        <LoadingIndicator text={t('Transact-Loading')} height={344} />
      : isError ?
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      : <WithdrawForm />}
    </Container>
  );
});

const WithdrawForm = memo(function WithdrawForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const i18key = useMemo(() => {
    return (
      hasOptions ?
        forceSelection ? 'Transact-SelectToken'
        : 'Transact-SelectAmount'
      : 'Transact-Withdraw'
    );
  }, [forceSelection, hasOptions]);

  return (
    <>
      <WithdrawnInWalletNotice css={styles.notice} />
      <WithdrawQueueLoader />
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {hasOptions ?
            <img src={zapIcon} alt="Zap" height={12} className={classes.zapIcon} />
          : null}
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
      <Actions>
        <WithdrawActions />
      </Actions>
      <FormFooter />
    </>
  );
});

const Container = styled('div', {
  base: {
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawFormLoader;
