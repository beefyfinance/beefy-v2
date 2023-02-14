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
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectUserVaultDepositInDepositTokenExcludingBoosts } from '../../../../../data/selectors/balance';
import { errorToString } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { TransactQuote } from '../TransactQuote';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput';
import { VaultFees } from '../VaultFees';
import { WithdrawActions } from '../WithdrawActions';
import { StakedInBoost } from '../StakedInboost';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import { WithdrawLinks } from '../WithDrawLinks';

const useStyles = makeStyles(styles);

const DepositedInVault = memo(function () {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const token = useAppSelector(state =>
    vault ? selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress) : null
  );
  const balance = useAppSelector(state =>
    vault && token ? selectUserVaultDepositInDepositTokenExcludingBoosts(state, vaultId) : null
  );

  if (!vault || !token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return <TokenAmountFromEntity amount={balance} token={token} minShortPlaces={4} />;
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

  return (
    <>
      <StakedInBoost className={classes.stakedInBoost} />
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {t(hasOptions ? 'Transact-SelectToken' : 'Transact-Withdraw')}
        </div>
        <div className={classes.availableLabel}>
          {t('Transact-Available')}{' '}
          <span className={classes.availableLabelAmount}>
            <DepositedInVault />
          </span>
        </div>
      </div>
      <div className={classes.inputs}>
        <TokenSelectButton />
        <WithdrawTokenAmountInput />
      </div>
      <WithdrawLinks className={classes.links} />
      <TransactQuote title={t('Transact-YouWithdraw')} className={classes.quote} />
      <div className={classes.actions}>
        <WithdrawActions />
      </div>
      <VaultFees className={classes.fees} />
    </>
  );
});
