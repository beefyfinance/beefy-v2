import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import {
  TokenAmount,
  TokenAmountFromEntity,
} from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { errorToString } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { isVaultActive } from '../../../../../data/entities/vault.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { RetirePauseReason } from '../../../RetirePauseReason/RetirePauseReason.tsx';
import { Actions } from '../Actions/Actions.tsx';
import { DepositActions } from '../DepositActions/DepositActions.tsx';
import { DepositBuyLinks } from '../DepositBuyLinks/DepositBuyLinks.tsx';
import { DepositTokenAmountInput } from '../DepositTokenAmountInput/DepositTokenAmountInput.tsx';
import { FormFooter } from '../FormFooter/FormFooter.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type TokenInWalletProps = {
  token: TokenEntity;
  index: number;
};

const TokenInWallet = memo(function TokenInWallet({ token, index }: TokenInWalletProps) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector(state =>
    token ? selectUserBalanceOfToken(state, token.chainId, token.address) : undefined
  );

  const handleMax = useCallback(() => {
    if (token && balance) {
      dispatch(
        transactSetInputAmount({
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

const DepositFormLoader = memo(function DepositFormLoader() {
  const { t } = useTranslation();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <Container>
      {!isVaultActive(vault) ?
        <RetirePauseReason vaultId={vaultId} />
      : isLoading ?
        <LoadingIndicator text={t('Transact-Loading')} height={344} />
      : isError ?
        <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
      : <DepositForm />}
    </Container>
  );
});

const DepositForm = memo(function DepositForm() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <div className={classes.inputs}>
        <DepositFormInputs />
      </div>
      <DepositBuyLinks css={styles.links} />
      <TransactQuote title={t('Transact-YouDeposit')} css={styles.quote} />
      <Actions>
        <DepositActions />
      </Actions>
      <FormFooter />
    </>
  );
});

const DepositFormInputs = memo(function DepositFormInputs() {
  const { t } = useTranslation();
  const selection = useAppSelector(selectTransactSelected);
  const multipleInputs = selection.tokens.length > 1;
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const availableLabel = t('Transact-Available');
  const firstSelectLabel = useMemo(() => {
    return t(
      hasOptions ?
        forceSelection ? 'Transact-SelectToken'
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
        forceSelection ?
          <TokenAmount amount={BIG_ZERO} decimals={18} />
        : <TokenInWallet token={token} index={index} />
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
  tokenAvailable?: ReactNode;
};

const DepositFormInput = memo(function DepositFormInput({
  index,
  token,
  selectLabel,
  availableLabel,
  showZapIcon,
  tokenAvailable,
}: DepositFormInputProps) {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {showZapIcon ?
            <img src={zapIcon} alt="Zap" height={12} className={classes.zapIcon} />
          : null}
          {selectLabel}
        </div>
        {tokenAvailable ?
          <div className={classes.availableLabel}>
            {availableLabel} <span className={classes.availableLabelAmount}>{tokenAvailable}</span>
          </div>
        : null}
      </div>
      <div className={classes.amount}>
        <DepositTokenAmountInput token={token} index={index} />
      </div>
    </div>
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
export default DepositFormLoader;
