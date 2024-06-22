import React, { memo, type ReactNode, useCallback, useMemo } from 'react';
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
import { isVaultActive } from '../../../../../data/entities/vault';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { TextLoader } from '../../../../../../components/TextLoader';
import type { TokenEntity } from '../../../../../data/entities/token';

const useStyles = makeStyles(styles);

type TokenInWalletProps = {
  token: TokenEntity;
  index: number;
};

const TokenInWallet = memo<TokenInWalletProps>(function TokenInWallet({ token, index }) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

  const handleMax = useCallback(() => {
    if (token && balance) {
      dispatch(
        transactActions.setInputAmount({
          index,
          amount: balance,
          max: true,
        })
      );
    }
  }, [balance, dispatch, token, index]);

  if (!token || !balance) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return <TokenAmountFromEntity onClick={handleMax} amount={balance} token={token} />;
});

export const DepositFormLoader = memo(function DepositFormLoader() {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <div className={classes.container}>
      {!isVaultActive(vault) ? (
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

  return (
    <>
      <div className={classes.inputs}>
        <DepositFormInputs />
      </div>
      <DepositBuyLinks className={classes.links} />
      <TransactQuote title={t('Transact-YouDeposit')} className={classes.quote} />
      <DepositActions className={classes.actions} />
    </>
  );
});

const DepositFormInputs = memo(function DepositFormInputs() {
  const { t } = useTranslation();
  const selection = useAppSelector(selectTransactSelected);
  const multipleInputs = selection.tokens.length > 1;
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selecTransactForceSelection);
  const availableLabel = t('Transact-Available');
  const firstSelectLabel = useMemo(() => {
    return t(
      hasOptions
        ? forceSelection
          ? 'Transact-SelectToken'
          : 'Transact-SelectAmount'
        : 'Transact-Deposit'
    );
  }, [forceSelection, hasOptions, t]);

  if (forceSelection) {
    return (
      <DepositFormInput
        index={0}
        token={selection.tokens[0]}
        availableLabel={availableLabel}
        selectLabel={t('Transact-SelectToken')}
        showZapIcon={hasOptions}
        tokenAvailable={<TokenAmount amount={BIG_ZERO} decimals={18} />}
      />
    );
  }

  return selection.tokens.map((token, index) => (
    <DepositFormInput
      key={index}
      index={index}
      token={token}
      availableLabel={availableLabel}
      selectLabel={!multipleInputs && index === 0 ? firstSelectLabel : token.symbol}
      showZapIcon={hasOptions && index === 0}
      tokenAvailable={
        forceSelection ? (
          <TokenAmount amount={BIG_ZERO} decimals={18} />
        ) : (
          <TokenInWallet token={token} index={index} />
        )
      }
    />
  ));
});

type DepositFormInputProps = {
  token: TokenEntity;
  index: number;
  selectLabel: string;
  availableLabel: string;
  showZapIcon: boolean;
  tokenAvailable: ReactNode;
};

const DepositFormInput = memo<DepositFormInputProps>(function DepositFormInput({
  index,
  token,
  selectLabel,
  availableLabel,
  showZapIcon,
  tokenAvailable,
}) {
  const classes = useStyles();

  return (
    <div className={classes.input}>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {showZapIcon ? <img src={zapIcon} alt="Zap" height={12} /> : null}
          {selectLabel}
        </div>
        <div className={classes.availableLabel}>
          {availableLabel} <span className={classes.availableLabelAmount}>{tokenAvailable}</span>
        </div>
      </div>
      <div className={classes.amount}>
        <DepositTokenAmountInput token={token} index={index} />
      </div>
    </div>
  );
});
