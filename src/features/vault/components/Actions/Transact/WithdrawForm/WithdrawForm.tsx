import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectUserVaultDepositInDepositTokenExcludingBoostsBridged } from '../../../../../data/selectors/balance';
import { errorToString } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { TransactQuote } from '../TransactQuote';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput';
import { WithdrawActions } from '../WithdrawActions';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { WithdrawnInWalletNotice } from '../WithdrawnInWalletNotice';
import { useDispatch } from 'react-redux';
import { transactActions } from '../../../../../data/reducers/wallet/transact';

const useStyles = makeStyles(styles);

const DepositedInVault = memo(function DepositedInVault() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const dispatch = useDispatch();
  const token = useAppSelector(state =>
    vault ? selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress) : null
  );
  const balance = useAppSelector(state =>
    vault && token
      ? selectUserVaultDepositInDepositTokenExcludingBoostsBridged(state, vaultId)
      : null
  );
  const forceSelection = useAppSelector(selecTransactForceSelection);

  const handleMax = useCallback(() => {
    token &&
      balance &&
      dispatch(
        transactActions.setInputAmount({
          amount: balance,
          max: true,
        })
      );
  }, [balance, dispatch, token]);

  if (!vault || !token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  if (forceSelection) {
    return <TokenAmountFromEntity amount={balance} token={token} />;
  }

  return <TokenAmountFromEntity onClick={handleMax} amount={balance} token={token} />;
});

export const WithdrawFormLoader = memo(function WithdrawFormLoader() {
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
  const forceSelection = useAppSelector(selecTransactForceSelection);

  const i18key = useMemo(() => {
    return hasOptions
      ? forceSelection
        ? 'Transact-SelectToken'
        : 'Transact-SelectAmount'
      : 'Transact-Withdraw';
  }, [forceSelection, hasOptions]);

  return (
    <>
      <WithdrawnInWalletNotice className={classes.notice} />
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
      <TransactQuote title={t('Transact-YouWithdraw')} className={classes.quote} />
      <div className={classes.actions}>
        <WithdrawActions />
      </div>
    </>
  );
});
