import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { Fragment, memo, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import type { ReloadSpinnerState } from '../../../../../../components/ReloadSpinner/ReloadSpinner.tsx';
import { useCollapse } from '../../../../../../components/Collapsable/hooks.ts';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import {
  transactClearQuotes,
  transactFetchQuotes,
  transactFetchQuotesIfNeeded,
} from '../../../../../data/actions/transact.ts';
import {
  getEffectiveQuote,
  quoteHasTransformation,
  totalValueOfTokenAmounts,
} from '../../../../../data/apis/transact/helpers/quotes.ts';
import {
  CrossChainBridgeBelowFeeError,
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotActionableError,
  QuoteCowcentratedNotCalmAndNotActionableError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import {
  type CowcentratedVaultDepositQuote,
  type CowcentratedZapDepositQuote,
  type CowcentratedDualZapDepositQuote,
  isCowcentratedDepositQuote,
  isZapQuote,
  quoteNeedsSlippage,
  type TokenAmount as QuoteTokenAmount,
  type TransactQuote as TransactQuoteType,
} from '../../../../../data/apis/transact/transact-types.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../../../../../data/entities/vault.ts';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactCrossChainPreflight,
  selectTransactInputAmounts,
  selectTransactInputMaxes,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactSelectedQuote,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSelectedSelectionId,
  selectTransactSlippage,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { QuoteTitleRefresh } from '../QuoteTitleRefresh/QuoteTitleRefresh.tsx';
import { TokenAmountIcon, TokenAmountIconLoader } from '../TokenAmountIcon/TokenAmountIcon.tsx';
import { ZapRoute } from '../ZapRoute/ZapRoute.tsx';
import { ZapSlippage } from '../ZapSlippage/ZapSlippage.tsx';
import { NOT_CALM_REFRESH_SECONDS, useNotCalmAutoRefresh } from '../hooks/useNotCalmAutoRefresh.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type TransactQuoteProps = {
  title: string;
  css?: CssStyles;
};
export const TransactQuote = memo(function TransactQuote({
  title,
  css: cssProp,
}: TransactQuoteProps) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const selectionId = useAppSelector(selectTransactSelectedSelectionId);
  const selection = useAppSelector(selectTransactSelected);
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const inputMaxes = useAppSelector(selectTransactInputMaxes);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const preflightOk = useAppSelector(selectTransactCrossChainPreflight);
  const slippage = useAppSelector(selectTransactSlippage);
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const inputIsZero = useMemo(
    () => inputAmounts.every(amount => amount.lte(BIG_ZERO)),
    [inputAmounts]
  );
  const { stickyNotCalmAction, showNotCalmRefresh } = useNotCalmAutoRefresh();

  const debouncedFetchQuotes = useMemo(
    () =>
      debounce(
        (
          dispatch: ReturnType<typeof useAppDispatch>,
          inputAmounts: BigNumber[],
          preflightOk: boolean
        ) => {
          const inputIsZero = inputAmounts.every(amount => amount.lte(BIG_ZERO));
          if (inputIsZero || !preflightOk) {
            dispatch(transactClearQuotes());
          } else {
            dispatch(transactFetchQuotesIfNeeded());
          }
        },
        200,
        { leading: false, trailing: true, maxWait: 1000 }
      ),
    []
  );

  useEffect(() => {
    debouncedFetchQuotes(dispatch, inputAmounts, preflightOk);
  }, [
    dispatch,
    mode,
    chainId,
    selectionId,
    selection,
    inputAmounts,
    inputMaxes,
    preflightOk,
    debouncedFetchQuotes,
  ]);

  // slippage isn't part of the if-needed change check, so force a re-quote when it changes
  const skipInitialSlippageRequote = useRef(true);
  useEffect(() => {
    if (skipInitialSlippageRequote.current) {
      skipInitialSlippageRequote.current = false;
      return;
    }
    if (!inputIsZero && preflightOk) {
      dispatch(transactFetchQuotes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on slippage only
  }, [slippage]);

  // preview "You receive" for all CLM vaults AND pools so the placeholder title matches the (transforming) result
  const quote = useAppSelector(
    state => status === TransactStatus.Fulfilled && selectTransactSelectedQuoteOrUndefined(state)
  );
  const isTransformTitle = useMemo(
    () => isCowcentratedLikeVault(vault) || (!!quote && quoteHasTransformation(quote)),
    [vault, quote]
  );

  // single QuotePanel across all statuses so ReloadSpinner stays mounted and its click spin isn't lost
  return (
    <QuotePanel
      css={cssProp}
      disabled={status === TransactStatus.Idle}
      title={isTransformTitle ? t('Transact-YouReceive') : title}
      enableRefresh={status === TransactStatus.Pending ? 'disabled' : true}
      autoRefresh={
        (status === TransactStatus.Pending || status === TransactStatus.Rejected) &&
        showNotCalmRefresh
      }
    >
      {status === TransactStatus.Fulfilled ?
        <QuoteFulfilledBody />
      : status === TransactStatus.Idle ?
        <QuoteIdleBody vault={vault} mode={mode} />
      : stickyNotCalmAction ?
        <CalmAlert i18nKey={`Transact-Quote-Error-Calm-Retry-${stickyNotCalmAction}`} />
      : status === TransactStatus.Pending ?
        <TokenAmountIconLoader />
      : <QuoteError />}
    </QuotePanel>
  );
});

type QuotePanelProps = {
  title: string;
  enableRefresh: ReloadSpinnerState;
  autoRefresh?: boolean;
  disabled?: boolean;
  css?: CssStyles;
  children: ReactNode;
};

const QuotePanel = memo(function QuotePanel({
  title,
  enableRefresh,
  autoRefresh = false,
  disabled = false,
  css: cssProp,
  children,
}: QuotePanelProps) {
  return (
    <div className={css(disabled && styles.disabled, cssProp)}>
      <QuoteTitleRefresh
        title={title}
        enableRefresh={enableRefresh}
        autoRefresh={autoRefresh}
        autoRefreshSeconds={NOT_CALM_REFRESH_SECONDS}
      />
      {children}
    </div>
  );
});

const QuoteFulfilledBody = memo(function QuoteFulfilledBody() {
  const quote = useAppSelector(selectTransactSelectedQuote);
  const effectiveQuote = getEffectiveQuote(quote);
  return <QuoteLoaded quote={quote} effectiveQuote={effectiveQuote} />;
});

type QuoteIdleBodyProps = {
  vault: VaultEntity;
  mode: TransactMode;
};
const QuoteIdleBody = memo(function QuoteIdleBody({ vault, mode }: QuoteIdleBodyProps) {
  const classes = useStyles();

  // only clm withdraw has the 2-token idle screen
  if (mode === TransactMode.Withdraw && isCowcentratedLikeVault(vault)) {
    return (
      <div className={classes.tokenAmounts}>
        <div className={classes.amountReturned}>
          <TokenAmountList
            variant="card"
            itemCss={styles.fullWidth}
            items={vault.depositTokenAddresses.map(address => ({
              amount: BIG_ZERO,
              token: { chainId: vault.chainId, address },
            }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={classes.youReceiveCard}>
      <TokenAmountIcon
        amount={BIG_ZERO}
        chainId={vault.chainId}
        tokenAddress={vault.depositTokenAddress}
        variant="bare"
      />
    </div>
  );
});

type CalmAlertProps = {
  i18nKey: string;
};
export const CalmAlert = memo(function CalmAlert({ i18nKey }: CalmAlertProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <AlertWarning>
      <Trans
        t={t}
        i18nKey={i18nKey}
        values={{ interval: NOT_CALM_REFRESH_SECONDS }}
        components={{
          LinkCalm: (
            <ExternalLink
              className={classes.link}
              href="https://docs.beefy.finance/beefy-products/clm#calmness-check"
            />
          ),
        }}
      />
    </AlertWarning>
  );
});

const QuoteError = memo(function QuoteError() {
  const { t } = useTranslation();
  const error = useAppSelector(selectTransactQuoteError);
  const mode = useAppSelector(selectTransactMode);

  if (error) {
    if (CrossChainBridgeBelowFeeError.match(error)) {
      const action = mode === TransactMode.Deposit ? 'deposit' : 'withdraw';
      return <AlertError>{t(`Transact-Quote-Error-CrossChain-TooLow-${action}`)}</AlertError>;
    }
    if (QuoteCowcentratedNoSingleSideError.match(error)) {
      return (
        <AlertError>
          {t('Transact-Notice-CowcentratedNoSingleSideAllowed', {
            inputToken: error.inputToken,
            neededToken: error.neededToken,
          })}
        </AlertError>
      );
    }
    if (QuoteCowcentratedNotActionableError.match(error)) {
      return <QuoteNotActionableError action={error.action} actionableAt={error.actionableAt} />;
    }
    if (QuoteCowcentratedNotCalmAndNotActionableError.match(error)) {
      return (
        <AlertError>{t(`Transact-Quote-Error-NotCalmAndNotActionable-${error.action}`)}</AlertError>
      );
    }
    if (QuoteCowcentratedNotCalmError.match(error)) {
      return <CalmAlert i18nKey={`Transact-Quote-Error-Calm-Retry-${error.action}`} />;
    }
  }

  return (
    <AlertError>
      <p>{t('Transact-Quote-Error')}</p>
      {error && error.message ?
        <p>{error.message}</p>
      : null}
    </AlertError>
  );
});

type QuoteNotActionableErrorProps = {
  action: 'deposit' | 'withdraw';
  actionableAt: number;
  css?: CssStyles;
};
export const QuoteNotActionableError = memo(function QuoteNotActionableError({
  action,
  actionableAt,
  css: cssProp,
}: QuoteNotActionableErrorProps) {
  const { t } = useTranslation();
  // match() narrows on name alone, so actionableAt can be missing if the thunk didn't serialize it
  const target = Number.isFinite(actionableAt) ? actionableAt : 0;
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, target - Math.floor(Date.now() / 1000))
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, target - Math.floor(Date.now() / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [target, secondsLeft]);

  return (
    <AlertError css={cssProp}>
      {t(`Transact-Quote-Error-NotActionable-${action}`, { secondsLeft })}
    </AlertError>
  );
});

type QuoteLoadedProps = {
  quote: TransactQuoteType;
  effectiveQuote: TransactQuoteType;
};
const QuoteLoaded = memo(function QuoteLoaded({ quote, effectiveQuote }: QuoteLoadedProps) {
  const isZap = isZapQuote(quote);
  const needsSlippage = quoteNeedsSlippage(quote);
  const returned = useMemo(
    () => quote.returned.filter(r => r.amount.gt(BIG_ZERO)),
    [quote.returned]
  );
  const cowcentratedDepositQuote =
    isCowcentratedDepositQuote(effectiveQuote) ? effectiveQuote : null;

  return (
    <>
      {cowcentratedDepositQuote ?
        <CowcentratedYouReceiveSection quote={cowcentratedDepositQuote} returned={returned} />
      : <YouReceiveSection outputs={quote.outputs} returned={returned} />}
      {isZap ?
        <ZapRoute quote={quote} css={styles.route} />
      : null}
      {needsSlippage ?
        <ZapSlippage css={styles.slippage} />
      : null}
    </>
  );
});

const tokenKey = (token: Pick<TokenEntity, 'chainId' | 'address'>) =>
  `${token.chainId}-${token.address}`;

type TokenAmountListItem = {
  amount: BigNumber;
  token: Pick<TokenEntity, 'chainId' | 'address'>;
};

type TokenAmountListProps = {
  items: TokenAmountListItem[];
  variant?: 'card' | 'bare';
  itemCss?: CssStyles;
};

const TokenAmountList = memo(function TokenAmountList({
  items,
  variant,
  itemCss,
}: TokenAmountListProps) {
  return (
    <>
      {items.map(({ token, amount }) => (
        <TokenAmountIcon
          key={tokenKey(token)}
          amount={amount}
          chainId={token.chainId}
          tokenAddress={token.address}
          variant={variant}
          css={itemCss}
        />
      ))}
    </>
  );
});

const CardDivider = styled('hr', {
  base: {
    height: '1px',
    background: 'background.border',
    border: 'none',
    margin: '0',
  },
});

// dust worth under a cent isn't worth surfacing — hides the dust line and the total it feeds
const DUST_MIN_USD = 0.01;

// shared "You receive" card: card chrome + dust toggle/total footer + USD math; the card body is passed in
type YouReceiveCardProps = {
  outputs: QuoteTokenAmount[];
  returned: QuoteTokenAmount[];
  children: ReactNode;
};
const YouReceiveCard = memo(function YouReceiveCard({
  outputs,
  returned,
  children,
}: YouReceiveCardProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { open, handleToggle, Icon } = useCollapse();
  const dustRowsId = useId();
  const outputsUsd = useAppSelector(
    state => totalValueOfTokenAmounts(outputs, state),
    (prev, next) => prev.eq(next)
  );
  const dustUsd = useAppSelector(
    state => totalValueOfTokenAmounts(returned, state),
    (prev, next) => prev.eq(next)
  );
  const { dustUsdFormatted, totalUsdFormatted, showDust } = useMemo(() => {
    return {
      dustUsdFormatted: formatLargeUsd(dustUsd),
      totalUsdFormatted: formatLargeUsd(outputsUsd.plus(dustUsd)),
      showDust: returned.length > 0 && dustUsd.gte(DUST_MIN_USD),
    };
  }, [dustUsd, outputsUsd, returned]);

  return (
    <div className={classes.youReceiveCard}>
      {children}
      {showDust ?
        <>
          <CardDivider />
          <button
            type="button"
            className={classes.dustToggle}
            onClick={handleToggle}
            aria-expanded={open}
            aria-controls={open ? dustRowsId : undefined}
          >
            <span className={classes.dustToggleLabel}>
              {t('Transact-DustSummary', { dustValue: dustUsdFormatted })}
            </span>
            <span className={classes.dustToggleChevron}>
              <Icon />
            </span>
          </button>
          {open ?
            <div id={dustRowsId} className={classes.dustRows}>
              <TokenAmountList items={returned} variant="bare" />
            </div>
          : null}
          <CardDivider />
          <div className={classes.totalRow}>
            <span className={classes.totalText}>{t('Transact-Total')}</span>
            <span className={classes.totalText}>{totalUsdFormatted}</span>
          </div>
        </>
      : null}
    </div>
  );
});

type YouReceiveSectionProps = {
  outputs: QuoteTokenAmount[];
  returned: QuoteTokenAmount[];
};
const YouReceiveSection = memo(function YouReceiveSection({
  outputs,
  returned,
}: YouReceiveSectionProps) {
  return (
    <YouReceiveCard outputs={outputs} returned={returned}>
      <TokenAmountList items={outputs} variant="bare" />
    </YouReceiveCard>
  );
});

type CowcentratedYouReceiveSectionProps = {
  quote:
    | CowcentratedVaultDepositQuote
    | CowcentratedZapDepositQuote
    | CowcentratedDualZapDepositQuote;
  returned: QuoteTokenAmount[];
};
const CowcentratedYouReceiveSection = memo(function CowcentratedYouReceiveSection({
  quote,
  returned,
}: CowcentratedYouReceiveSectionProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, quote.option.vaultId));
  const shares = quote.outputs[0];
  const outputs = useMemo(() => [shares], [shares]);

  return (
    <YouReceiveCard outputs={outputs} returned={returned}>
      <TokenAmountIcon
        amount={shares.amount}
        chainId={shares.token.chainId}
        tokenAddress={vault.depositTokenAddress}
        variant="bare"
      />
      <CardDivider />
      <div className={classes.clmPositionGrid}>
        {quote.position.map((pos, i) => (
          <Fragment key={tokenKey(pos.token)}>
            {i > 0 ?
              <div className={classes.clmPositionCellDivider} />
            : null}
            <TokenAmountIcon
              amount={pos.amount}
              chainId={pos.token.chainId}
              tokenAddress={pos.token.address}
              variant="bare"
              reverse={true}
              showSymbol={false}
              css={styles.clmPositionCell}
            />
          </Fragment>
        ))}
      </div>
    </YouReceiveCard>
  );
});
