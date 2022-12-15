import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { TokenSelectButton } from '../TokenSelectButton';
import {
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedTokenAddresses,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { errorToString } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { DepositTokenAmountInput } from '../DepositTokenAmountInput';
import { DepositBuyLinks } from '../DepositBuyLinks';
import { DepositActions } from '../DepositActions';
import { TransactQuote } from '../TransactQuote';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { VaultFees } from '../VaultFees';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { RetirePauseReason } from '../../../RetirePauseReason';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';

const useStyles = makeStyles(styles);

const SelectedInWallet = memo(function () {
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const tokenAddresses = useAppSelector(selectTransactSelectedTokenAddresses);

  const token = useAppSelector(state =>
    tokenAddresses.length && chainId
      ? selectTokenByAddress(state, chainId, tokenAddresses[0])
      : undefined
  );
  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

  if (!chainId || !tokenAddresses.length || !token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return <TokenAmountFromEntity amount={balance} token={token} minShortPlaces={4} />;
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
        <TokenSelectButton />
        <DepositTokenAmountInput />
      </div>
      <DepositBuyLinks className={classes.links} />
      <TransactQuote title={t('Transact-YouDeposit')} className={classes.quote} />
      <DepositActions className={classes.actions} />
      <VaultFees className={classes.fees} />
    </>
  );
});
