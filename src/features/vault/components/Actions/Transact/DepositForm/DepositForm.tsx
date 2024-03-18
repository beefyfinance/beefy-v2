import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { errorToString } from '../../../../../../helpers/format';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { DepositTokenAmountInput } from '../DepositTokenAmountInput';
import { DepositBuyLinks } from '../DepositBuyLinks';
import { DepositActions } from '../DepositActions';
import { TransactQuote } from '../TransactQuote';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { RetirePauseReason } from '../../../RetirePauseReason';
import { TokenAmount, TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';
import { TextLoader } from '../../../../../../components/TextLoader';

const useStyles = makeStyles(styles);

const SelectedInWallet = memo(function SelectedInWallet() {
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const selection = useAppSelector(selectTransactSelected);
  const forceSelection = useAppSelector(selecTransactForceSelection);
  const dispatch = useAppDispatch();
  const token = selection?.tokens?.[0];

  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

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

  if (!chainId || !selection || !token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  if (forceSelection) {
    return <TokenAmount amount={BIG_ZERO} decimals={18} price={BIG_ONE} />;
  }

  return (
    <TokenAmountFromEntity onClick={handleMax} amount={balance} token={token} minShortPlaces={4} />
  );
});

export const DepositFormLoader = memo(function DepositFormLoader() {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={classes.container}>
      {vault.status !== 'active' ? (
        <RetirePauseReason vaultId={vaultId} />
      ) : isLoading ? (
        <LoadingIndicator text={t('Transact-Loading')} />
      ) : isError ? (
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      ) : (
        <DepositForm />
      )}
    </div>
  );
});

export const DepositForm = memo(function DepositForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;

  return (
    <>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {hasOptions ? <img src={zapIcon} alt="Zap" height={12} /> : null}
          {t(hasOptions ? 'Transact-SelectToken' : 'Transact-Deposit')}
        </div>
        <div className={classes.availableLabel}>
          {t('Transact-Available')}{' '}
          <span className={classes.availableLabelAmount}>
            <SelectedInWallet />
          </span>
        </div>
      </div>
      <div className={classes.inputs}>
        <DepositTokenAmountInput />
      </div>
      <DepositBuyLinks className={classes.links} />
      <TransactQuote title={t('Transact-YouDeposit')} className={classes.quote} />
      <DepositActions className={classes.actions} />
    </>
  );
});
