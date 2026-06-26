import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { errorToString } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectUserVaultBalanceInDepositTokenWithToken,
  selectUserVaultBalanceInShareToken,
} from '../../../../../data/selectors/balance.ts';
import {
  selectTransactForceSelection,
  selectTransactIsActiveSelectionVaultSourceWithdraw,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { Actions } from '../Actions/Actions.tsx';
import { CrossChainBelowFeeNotice } from '../CrossChainBelowFeeNotice/CrossChainBelowFeeNotice.tsx';
import { FormFooter } from '../FormFooter/FormFooter.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { WithdrawActions } from '../WithdrawActions/WithdrawActions.tsx';
import { WithdrawnInWalletNotice } from '../WithdrawnInWalletNotice/WithdrawnInWalletNotice.tsx';
import { WithdrawQueueLoader } from '../WithdrawQueue/WithdrawQueueLoader.tsx';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput/WithdrawTokenAmountInput.tsx';
import { useTransactSelectFlowCta } from '../hooks/useTransactSelectFlowCta.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

const DepositedInVault = memo(function DepositedInVault() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const isVaultSourceWithdraw = useAppSelector(selectTransactIsActiveSelectionVaultSourceWithdraw);
  const dispatch = useDispatch();
  const depositTokenAmount = useAppSelector(state =>
    vaultId ? selectUserVaultBalanceInDepositTokenWithToken(state, vaultId) : undefined
  );
  const shareBalance = useAppSelector(state =>
    vaultId ? selectUserVaultBalanceInShareToken(state, vaultId) : undefined
  );
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const handleMax = useCallback(() => {
    if (!depositTokenAmount) return;
    // store-of-record is share-math for vault-source withdraws; dispatch exact share-balance to avoid round-trip wei loss
    const amount =
      isVaultSourceWithdraw && shareBalance ? shareBalance : depositTokenAmount.amount;
    dispatch(
      transactSetInputAmount({
        index: 0,
        amount,
        max: true,
      })
    );
  }, [dispatch, depositTokenAmount, isVaultSourceWithdraw, shareBalance]);

  if (!vaultId || !depositTokenAmount) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return (
    <TokenAmountFromEntity
      onClick={forceSelection ? undefined : handleMax}
      amount={depositTokenAmount.amount}
      token={depositTokenAmount.token}
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
    <Container noPadding={isLoading}>
      {isLoading ?
        <LoadingIndicator text={t('Transact-Loading')} height={468} />
      : isError ?
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      : <WithdrawForm />}
    </Container>
  );
});

const WithdrawForm = memo(function WithdrawForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const { ctaLabel: selectLabel } = useTransactSelectFlowCta();

  return (
    <>
      <WithdrawnInWalletNotice css={styles.notice} />
      <WithdrawQueueLoader />
      <div className={classes.labels}>
        <div className={classes.selectLabel}>{selectLabel}</div>
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
      <CrossChainBelowFeeNotice css={styles.quote} />
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
      paddingInline: '24px',
      paddingBlock: '20px 24px',
    },
  },
  variants: {
    noPadding: {
      true: {
        padding: '0',
        sm: {
          padding: '0',
        },
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawFormLoader;
