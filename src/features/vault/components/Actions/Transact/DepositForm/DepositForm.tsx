import { styled } from '@repo/styles/jsx';
import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { errorToString } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSetInputAmount } from '../../../../../data/actions/transact.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { isVaultActive } from '../../../../../data/entities/vault.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectUserBalanceOfToken,
  selectUserVaultBalanceInDepositToken,
} from '../../../../../data/selectors/balance.ts';
import { selectTokenByAddress } from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactDepositFromVaultId,
  selectTransactForceSelection,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { RetirePauseReason } from '../../../RetirePauseReason/RetirePauseReason.tsx';
import { Actions } from '../Actions/Actions.tsx';
import { CrossChainBelowFeeNotice } from '../CrossChainBelowFeeNotice/CrossChainBelowFeeNotice.tsx';
import { DepositActions } from '../DepositActions/DepositActions.tsx';
import { DepositBuyLinks } from '../DepositBuyLinks/DepositBuyLinks.tsx';
import { DepositSourceToggle } from '../DepositSourceToggle/DepositSourceToggle.tsx';
import { DepositTokenAmountInput } from '../DepositTokenAmountInput/DepositTokenAmountInput.tsx';
import { FormFooter } from '../FormFooter/FormFooter.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { useTransactSelectFlowCta } from '../hooks/useTransactSelectFlowCta.ts';
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

type VaultBalanceProps = {
  index: number;
};
const VaultBalance = memo(function VaultBalance({ index }: VaultBalanceProps) {
  const dispatch = useAppDispatch();
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);
  const vault = useAppSelector(state =>
    fromVaultId ? selectVaultById(state, fromVaultId) : undefined
  );
  const depositToken = useAppSelector(state =>
    vault ? selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress) : undefined
  );
  const balance = useAppSelector(state =>
    fromVaultId ? selectUserVaultBalanceInDepositToken(state, fromVaultId) : undefined
  );

  const handleMax = useCallback(() => {
    if (balance) {
      dispatch(
        transactSetInputAmount({
          index,
          amount: balance,
          max: true,
        })
      );
    }
  }, [balance, dispatch, index]);

  if (!vault || !depositToken || !balance) {
    return null;
  }

  return <TokenAmountFromEntity onClick={handleMax} amount={balance} token={depositToken} />;
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
    <Container noPadding={isLoading && isVaultActive(vault)}>
      {!isVaultActive(vault) ?
        <RetirePauseReason vaultId={vaultId} />
      : isLoading ?
        <LoadingIndicator text={t('Transact-Loading')} height={468} />
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
        <DepositSourceToggle />
        <DepositFormInputs />
      </div>
      <DepositBuyLinks css={styles.links} />
      <CrossChainBelowFeeNotice css={styles.quote} />
      <TransactQuote title={t('Transact-YouDeposit')} css={styles.quote} />
      <Actions>
        <DepositActions />
      </Actions>
      <FormFooter />
    </>
  );
});

const DepositFormInputs = memo(function DepositFormInputs() {
  const selection = useAppSelector(selectTransactSelected);
  const multipleInputs = selection.tokens.length > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const { ctaLabel: firstSelectLabel } = useTransactSelectFlowCta();
  const fromVaultId = useAppSelector(selectTransactDepositFromVaultId);

  if (forceSelection) {
    return (
      <DepositFormInput index={0} token={selection.tokens[0]} selectLabel={firstSelectLabel} />
    );
  }

  return selection.tokens.map((token, index) => (
    <DepositFormInput
      key={index}
      index={index}
      token={token}
      selectLabel={!multipleInputs && index === 0 ? firstSelectLabel : token.symbol}
      tokenAvailable={
        fromVaultId ? <VaultBalance index={0} /> : <TokenInWallet token={token} index={index} />
      }
    />
  ));
});

type DepositFormInputProps = {
  token: TokenEntity;
  index: number;
  selectLabel: string;
  tokenAvailable?: ReactNode;
};

const DepositFormInput = memo(function DepositFormInput({
  index,
  token,
  selectLabel,
  tokenAvailable,
}: DepositFormInputProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div>
      <div className={classes.labels}>
        <div className={classes.selectLabel}>{selectLabel}</div>
        {tokenAvailable ?
          <div className={classes.availableLabel}>
            {t('Transact-Available')}{' '}
            <span className={classes.availableLabelAmount}>{tokenAvailable}</span>
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
export default DepositFormLoader;
