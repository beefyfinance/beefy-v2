import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../../../store.ts';
import {
  selectTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsError,
  selectTransactOptionsStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import {
  selectUserVaultBalanceInDepositTokenWithToken,
  selectVaultUserBalanceInDepositTokenBreakdown,
} from '../../../../../data/selectors/balance.ts';
import { errorToString } from '../../../../../../helpers/format.ts';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { TransactQuote } from '../TransactQuote/TransactQuote.tsx';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import { WithdrawTokenAmountInput } from '../WithdrawTokenAmountInput/WithdrawTokenAmountInput.tsx';
import { WithdrawActions } from '../WithdrawActions/WithdrawActions.tsx';
import {
  TokenAmount,
  TokenAmountFromEntity,
} from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { WithdrawnInWalletNotice } from '../WithdrawnInWalletNotice/WithdrawnInWalletNotice.tsx';
import { useDispatch } from 'react-redux';
import { transactActions } from '../../../../../data/reducers/wallet/transact.ts';
import { Actions } from '../Actions/Actions.tsx';
import { styled } from '@repo/styles/jsx';
import { selectStandardVaultById } from '../../../../../data/selectors/vaults.ts';
import { VaultIcon } from '../../../../../../components/VaultIdentity/components/VaultIcon/VaultIcon.tsx';
import {
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../../../data/selectors/tokens.ts';
import { groupBy } from 'lodash-es';
import type { TypeToArrayMap } from '../../../DisplacedBalances/DisplacedBalances.tsx';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { type BigNumber } from 'bignumber.js';
import ChevronRight from '../../../../../../images/icons/chevron-right.svg?react';
import { symbolToLabelAndTag } from '../../../../../../helpers/tokens.ts';

const useStyles = legacyMakeStyles(styles);

const DepositedInVault = memo(function DepositedInVault() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const dispatch = useDispatch();
  const tokenAmount = useAppSelector(state =>
    vaultId ? selectUserVaultBalanceInDepositTokenWithToken(state, vaultId) : undefined
  );
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const handleMax = useCallback(() => {
    if (tokenAmount) {
      dispatch(
        transactActions.setInputAmount({
          index: 0,
          amount: tokenAmount.amount,
          max: true,
        })
      );
    }
  }, [dispatch, tokenAmount]);

  if (!vaultId || !tokenAmount) {
    return <TextLoader placeholder="0.0000000 BNB-BIFI" />;
  }

  return (
    <TokenAmountFromEntity
      onClick={forceSelection ? undefined : handleMax}
      amount={tokenAmount.amount}
      token={tokenAmount.token}
    />
  );
});

const WithdrawFormLoader = memo(function WithdrawFormLoader() {
  const { t } = useTranslation();
  const status = useAppSelector(selectTransactOptionsStatus);
  const error = useAppSelector(selectTransactOptionsError);
  const isLoading = status === TransactStatus.Idle || status === TransactStatus.Pending;
  const isError = status === TransactStatus.Rejected;

  return (
    <>
      {isLoading ? (
        <Container>
          <LoadingIndicator text={t('Transact-Loading')} />
        </Container>
      ) : isError ? (
        <Container>
          <AlertError>{t('Transact-Options-Error', { error: errorToString(error) })}</AlertError>
        </Container>
      ) : (
        <Withdraw />
      )}
    </>
  );
});

export const Withdraw = memo(function Withdraw() {
  return (
    <div>
      <Container>
        <WithdrawForm />
      </Container>
      <WithdrawBoostNotice />
    </div>
  );
});

const WithdrawBoostNotice = memo(function WithdrawBoostNotice() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const breakdown = useAppSelector(state =>
    selectVaultUserBalanceInDepositTokenBreakdown(state, vaultId)
  );

  const entries = useMemo(
    () => groupBy(breakdown.entries, 'type') as TypeToArrayMap,
    [breakdown.entries]
  );

  const boostsBalance = useMemo(() => {
    if (entries.boost) {
      return entries.boost.reduce((acc, curr) => acc.plus(curr.amount), BIG_ZERO);
    }

    return BIG_ZERO;
  }, [entries.boost]);

  if (boostsBalance.gt(BIG_ZERO)) {
    return <BoostBalance balance={boostsBalance} vaultId={vaultId} />;
  }

  return null;
});

const BoostBalance = memo(function BoostBalance({
  balance,
  vaultId,
}: {
  balance: BigNumber;
  vaultId: VaultEntity['id'];
}) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectStandardVaultById(state, vaultId));
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const dispatch = useDispatch();

  const handleTab = useCallback(() => {
    dispatch(transactActions.switchMode(TransactMode.Boost));
  }, [dispatch]);

  const vaultSymbol = useMemo(() => {
    const symbol = symbolToLabelAndTag(depositToken.symbol);

    console.log(symbol);
    if (symbol.tag) {
      return symbol.tag;
    }

    return depositToken.symbol;
  }, [depositToken.symbol]);

  return (
    <WithdrawBoostContainer onClick={handleTab}>
      <FlexContainer>
        <TokenAmount amount={balance} decimals={mooToken.decimals} /> {vaultSymbol}
      </FlexContainer>
      <FlexContainer>
        <Trans
          t={t}
          i18nKey="Boost-Unstake-Notice"
          components={{
            Icon: <VaultIcon vaultId={vault.id} size={24} />,
          }}
        />
        <ChevronRight />
      </FlexContainer>
    </WithdrawBoostContainer>
  );
});

export const WithdrawForm = memo(function WithdrawForm() {
  const { t } = useTranslation();
  const classes = useStyles();
  const hasOptions = useAppSelector(selectTransactNumTokens) > 1;
  const forceSelection = useAppSelector(selectTransactForceSelection);

  const i18key = useMemo(() => {
    return hasOptions
      ? forceSelection
        ? 'Transact-SelectToken'
        : 'Transact-SelectAmount'
      : 'Transact-Withdraw';
  }, [forceSelection, hasOptions]);

  return (
    <>
      <WithdrawnInWalletNotice css={styles.notice} />
      <div className={classes.labels}>
        <div className={classes.selectLabel}>
          {hasOptions ? (
            <img src={zapIcon} alt="Zap" height={12} className={classes.zapIcon} />
          ) : null}
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
      <TransactQuote title={t('Transact-YouWithdraw')} css={styles.quote} />
      <Actions>
        <WithdrawActions />
      </Actions>
    </>
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

const WithdrawBoostContainer = styled('button', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 16px 8px 16px',
    color: 'text.black',
    background: 'background.content.boost',
    borderRadius: '0px 0px 12px 12px',
    width: '100%',
    sm: {
      padding: '6px 24px 8px 24px',
    },
  },
});

const FlexContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WithdrawFormLoader;
