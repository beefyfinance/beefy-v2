import React, { memo, useCallback, useMemo } from 'react';
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
import { DepositTokenAmountInput, V3DepositTokenAmountInput } from '../DepositTokenAmountInput';
import { DepositBuyLinks } from '../DepositBuyLinks';
import { DepositActions } from '../DepositActions';
import { TransactQuote } from '../TransactQuote';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import {
  selectCowcentratedVaultDepositTokenAddresses,
  selectVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../../../data/selectors/vaults';
import { RetirePauseReason } from '../../../RetirePauseReason';
import { TokenAmount, TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import zapIcon from '../../../../../../images/icons/zap.svg';
import {
  isCowcentratedLiquidityVault,
  type VaultCowcentrated,
} from '../../../../../data/entities/vault';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BIG_ONE, BIG_ZERO } from '../../../../../../helpers/big-number';
import { TextLoader } from '../../../../../../components/TextLoader';
import { selectIsContractDataLoadedOnChain } from '../../../../../data/selectors/data-loader';

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
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isCowVault = isCowcentratedLiquidityVault(vault);
  const isContractDataLoaded = useAppSelector(state =>
    selectIsContractDataLoadedOnChain(state, vault.chainId)
  );
  const strategy = useAppSelector(state => selectVaultStrategyAddressOrUndefined(state, vaultId));
  const isLoading =
    status === TransactStatus.Idle ||
    status === TransactStatus.Pending ||
    (isCowVault && !isContractDataLoaded);
  console.log(`isLoading ${isLoading} - strategy ${strategy}`);
  const isError = status === TransactStatus.Rejected;

  return (
    <div className={classes.container}>
      {vault.status !== 'active' ? (
        <RetirePauseReason vaultId={vaultId} />
      ) : isLoading ? (
        <LoadingIndicator text={t('Transact-Loading')} />
      ) : isError ? (
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      ) : isCowcentratedLiquidityVault(vault) ? (
        <CowcentratedDepositForm />
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
  const forceSelection = useAppSelector(selecTransactForceSelection);

  const i18key = useMemo(() => {
    return hasOptions
      ? forceSelection
        ? 'Transact-SelectToken'
        : 'Transact-SelectAmount'
      : 'Transact-Deposit';
  }, [forceSelection, hasOptions]);

  return (
    <>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {hasOptions ? <img src={zapIcon} alt="Zap" height={12} /> : null}
          {t(i18key)}
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

export const CowcentratedDepositForm = memo(function V3DepositForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId)) as VaultCowcentrated;
  const vaultDepositTokenAddresses = useAppSelector(state =>
    selectCowcentratedVaultDepositTokenAddresses(state, vaultId)
  );

  return (
    <>
      <div className={classes.v3Inputs}>
        {vaultDepositTokenAddresses.map((tokenAddress, index) => (
          <V3TokenInput
            key={tokenAddress}
            tokenAddress={tokenAddress}
            chainId={vault.chainId}
            index={index}
          />
        ))}
      </div>
      <TransactQuote title={t('Transact-YouDeposit')} className={classes.quote} />
      <DepositActions className={classes.actions} />
    </>
  );
});

interface V3TokenInputProps {
  tokenAddress: string;
  chainId: ChainEntity['id'];
  index: number;
}

export const V3TokenInput = memo<V3TokenInputProps>(function V3TokenInput({
  tokenAddress,
  chainId,
  index,
}) {
  const { t } = useTranslation();
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const classes = useStyles();
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );
  const dispatch = useAppDispatch();

  const handleMax = useCallback(() => {
    dispatch(
      transactActions.setDualInputAmount({
        amount: balance,
        max: true,
        index,
      })
    );
  }, [dispatch, balance, index]);

  return (
    <div>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>{token.symbol}</div>
        <div className={classes.availableLabel}>
          {t('Transact-Available')}{' '}
          <span className={classes.availableLabelAmount}>
            <TokenAmountFromEntity
              onClick={handleMax}
              amount={balance}
              token={token}
              minShortPlaces={4}
            />
          </span>
        </div>
      </div>
      <div className={classes.inputs}>
        <V3DepositTokenAmountInput index={index} />
      </div>
    </div>
  );
});
