import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { TokenSelectButton } from '../TokenSelectButton';
import {
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { selectUserVaultDepositInDepositTokenExcludingBoosts } from '../../../../../data/selectors/balance';
import { errorToString, formatBigDecimals } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { TransactQuote } from '../TransactQuote';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput';
import { VaultFees } from '../VaultFees';
import { WithdrawActions } from '../WithdrawActions';

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

  return (
    <>
      {formatBigDecimals(balance)} {token.symbol}
    </>
  );
});

export const WithdrawForm = memo(function () {
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
        <>
          <div className={classes.labels}>
            <div className={classes.selectLabel}>{t('Transact-SelectToken')}</div>
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
          <TransactQuote title={t('Transact-YouWithdraw')} className={classes.quote} />
          <div className={classes.actions}>
            <WithdrawActions />
          </div>
          <VaultFees />
        </>
      )}
    </div>
  );
});
