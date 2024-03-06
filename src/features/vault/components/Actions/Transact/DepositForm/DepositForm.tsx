import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { TokenSelectButton, V3TokenButton } from '../TokenSelectButton';
import {
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { errorToString } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';
import { DepositTokenAmountInput, V3DepositTokenAmountInput } from '../DepositTokenAmountInput';
import { DepositBuyLinks } from '../DepositBuyLinks';
import { DepositActions } from '../DepositActions';
import { TransactQuote } from '../TransactQuote';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { VaultFees } from '../VaultFees';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { RetirePauseReason } from '../../../RetirePauseReason';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { isCowcentratedLiquidityVault } from '../../../../../data/entities/vault';
import type { TokenEntity } from '../../../../../data/entities/token';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { selectTokenById } from '../../../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

const SelectedInWallet = memo(function SelectedInWallet() {
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const selection = useAppSelector(selectTransactSelected);
  const token = selection?.tokens?.[0];

  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

  if (!chainId || !selection || !token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return <TokenAmountFromEntity amount={balance} token={token} minShortPlaces={4} />;
});

export const DepositFormLoader = memo(function DepositFormLoader() {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactOptionsStatus);
  console.log('DepositFormLoader status:', status);
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

export const CowcentratedDepositForm = memo(function V3DepositForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <>
      <div className={classes.v3Inputs}>
        {vault.assetIds.map((assetId, index) => (
          <V3TokenInput key={assetId} tokenId={assetId} chainId={vault.chainId} index={index} />
        ))}
      </div>
      <TransactQuote title={t('Transact-YouDeposit')} className={classes.quote} />
      {/* <DepositActions className={classes.actions} /> */}
      <VaultFees className={classes.fees} />
    </>
  );
});

interface V3TokenInputProps {
  tokenId: TokenEntity['id'];
  chainId: ChainEntity['id'];
  index: number;
}

export const V3TokenInput = memo<V3TokenInputProps>(function V3TokenInput({
  tokenId,
  chainId,
  index,
}) {
  const { t } = useTranslation();
  const token = useAppSelector(state => selectTokenById(state, chainId, tokenId));
  const classes = useStyles();
  const balance = useAppSelector(state =>
    selectUserBalanceOfToken(state, token.chainId, token.address)
  );

  return (
    <div>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>{token.symbol}</div>
        <div className={classes.availableLabel}>
          {t('Transact-Available')}{' '}
          <span className={classes.availableLabelAmount}>
            <TokenAmountFromEntity amount={balance} token={token} minShortPlaces={4} />
          </span>
        </div>
      </div>
      <div className={classes.inputs}>
        <V3TokenButton token={token} />
        <V3DepositTokenAmountInput index={index} />
      </div>
    </div>
  );
});
