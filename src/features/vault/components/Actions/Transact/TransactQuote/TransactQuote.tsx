import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { Fragment, memo, type ReactNode, useEffect, useId, useMemo, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { AssetsImageWithChain } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { useCollapse } from '../../../../../../components/Collapsable/hooks.ts';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokensImageWithChain } from '../../../../../../components/TokenImage/TokenImage.tsx';
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
  totalValueOfTokenAmounts,
} from '../../../../../data/apis/transact/helpers/quotes.ts';
import {
  CrossChainBridgeBelowFeeError,
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import {
  type CowcentratedVaultDepositQuote,
  type CowcentratedZapDepositQuote,
  type CowcentratedDualZapDepositQuote,
  isCowcentratedDepositQuote,
  isCrossChainDepositQuote,
  isZapQuote,
  quoteNeedsSlippage,
  type TokenAmount as QuoteTokenAmount,
  type TransactQuote as TransactQuoteType,
} from '../../../../../data/apis/transact/transact-types.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import {
  isCowcentratedLikeVault,
  isCowcentratedVault,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens.ts';
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
    const inputIsZero = inputAmounts.every(amount => amount.lte(BIG_ZERO));
    if (!inputIsZero && preflightOk) {
      dispatch(transactFetchQuotes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on slippage only
  }, [slippage]);

  // a base CLM always transforms (deposit -> position, withdraw -> pair); its wrappers expose a plain Want option, so
  // only preview "You receive" for the base CLM to keep the title stable without mis-previewing a direct want deposit
  const isClmVault = isCowcentratedVault(vault);
  const isClmDeposit = mode === TransactMode.Deposit && isClmVault;
  const preFulfilledTitle = isClmVault ? t('Transact-YouReceive') : title;

  if (status === TransactStatus.Idle) {
    return <QuoteIdle title={preFulfilledTitle} isClmDeposit={isClmDeposit} css={cssProp} />;
  }

  return (
    <div className={css(cssProp)}>
      {status === TransactStatus.Fulfilled ?
        <QuoteFulfilled title={title} />
      : <>
          <QuoteTitleRefresh
            title={preFulfilledTitle}
            enableRefresh={status === TransactStatus.Rejected}
          />
          {status === TransactStatus.Pending ?
            <QuoteLoading />
          : null}
          {status === TransactStatus.Rejected ?
            <QuoteError />
          : null}
        </>
      }
    </div>
  );
});

const QuoteFulfilled = memo(function QuoteFulfilled({ title }: { title: string }) {
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isCrossChain = isCrossChainDepositQuote(quote);
  const effectiveQuote = getEffectiveQuote(quote);
  const isCowcentratedDeposit = isCowcentratedDepositQuote(effectiveQuote);
  const hasTransformation = useMemo(() => {
    if (isCowcentratedDeposit && !isCrossChain) return false;
    if (quote.returned.some(r => r.amount.gt(BIG_ZERO))) return true;
    if (quote.outputs.length > 1) return true;
    const firstInput = quote.inputs[0];
    const firstOutput = quote.outputs[0];
    if (!firstInput || !firstOutput) return false;
    return (
      firstInput.token.address !== firstOutput.token.address ||
      firstInput.token.chainId !== firstOutput.token.chainId
    );
  }, [quote, isCowcentratedDeposit, isCrossChain]);
  // only a simple (non-transforming) deposit/withdraw keeps a title + card; any transformation shows just "You receive"
  const showTitle = !hasTransformation && !isCowcentratedDeposit;

  return (
    <>
      {showTitle ?
        <QuoteTitleRefresh title={title} enableRefresh={true} />
      : null}
      <QuoteLoaded
        quote={quote}
        effectiveQuote={effectiveQuote}
        hasTransformation={hasTransformation}
        showTitle={showTitle}
      />
    </>
  );
});

const QuoteIdle = memo(function QuoteIdle({
  title,
  isClmDeposit,
  css: cssProp,
}: TransactQuoteProps & { isClmDeposit: boolean }) {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={css(styles.disabled, cssProp)}>
      <QuoteTitleRefresh title={title} enableRefresh={true} />
      {isClmDeposit ?
        <div className={classes.youReceiveCard}>
          <LpSharePrimaryRow
            amount={BIG_ZERO}
            chainId={vault.chainId}
            tokenAddress={vault.depositTokenAddress}
            vaultId={vault.id}
          />
        </div>
      : <div className={classes.tokenAmounts}>
          {isCowcentratedLikeVault(vault) ?
            <div className={classes.amountReturned}>
              {vault.depositTokenAddresses.map(tokenAddress => {
                return (
                  <TokenAmountIcon
                    key={tokenAddress}
                    amount={BIG_ZERO}
                    chainId={vault.chainId}
                    tokenAddress={tokenAddress}
                    css={styles.fullWidth}
                  />
                );
              })}
            </div>
          : <TokenAmountIcon
              amount={BIG_ZERO}
              chainId={vault.chainId}
              tokenAddress={vault.depositTokenAddress}
            />
          }
        </div>
      }
    </div>
  );
});

const QuoteError = memo(function QuoteError() {
  const classes = useStyles();
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
    if (QuoteCowcentratedNotCalmError.match(error)) {
      return (
        <AlertError>
          <Trans
            t={t}
            i18nKey={`Transact-Quote-Error-Calm-${error.action}`}
            components={{
              LinkCalm: (
                <ExternalLink
                  className={classes.link}
                  href={'https://docs.beefy.finance/beefy-products/clm#calmness-check'}
                />
              ),
            }}
          />
        </AlertError>
      );
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

const QuoteLoading = memo(function QuoteLoading() {
  return <TokenAmountIconLoader />;
});

export type QuoteLoadedProps = {
  quote: TransactQuoteType;
  effectiveQuote: TransactQuoteType;
  hasTransformation: boolean;
  showTitle?: boolean;
  showRouteBlocks?: boolean;
};
export const QuoteLoaded = memo(function QuoteLoaded({
  quote,
  effectiveQuote,
  hasTransformation,
  showTitle = true,
  showRouteBlocks = true,
}: QuoteLoadedProps) {
  const classes = useStyles();
  const isZap = isZapQuote(quote);
  const needsSlippage = quoteNeedsSlippage(quote);
  const returned = useMemo(
    () => quote.returned.filter(r => r.amount.gt(BIG_ZERO)),
    [quote.returned]
  );
  const cowcentratedDepositQuote =
    isCowcentratedDepositQuote(effectiveQuote) ? effectiveQuote : null;

  const topCard: ReactNode =
    !cowcentratedDepositQuote && !hasTransformation ?
      <TokenAmountList items={quote.outputs} />
    : null;

  return (
    <>
      {topCard ?
        <div className={classes.tokenAmounts}>{topCard}</div>
      : null}
      {cowcentratedDepositQuote ?
        <CowcentratedYouReceiveSection
          quote={cowcentratedDepositQuote}
          returned={returned}
          showRefresh={!showTitle}
        />
      : hasTransformation ?
        <YouReceiveSection outputs={quote.outputs} returned={returned} showRefresh={!showTitle} />
      : null}
      {showRouteBlocks && isZap ?
        <ZapRoute quote={quote} css={styles.route} />
      : null}
      {showRouteBlocks && needsSlippage ?
        <ZapSlippage css={styles.slippage} />
      : null}
    </>
  );
});

const TokenAmountList = memo(function TokenAmountList({ items }: { items: QuoteTokenAmount[] }) {
  return (
    <>
      {items.map(({ token, amount }) => (
        <TokenAmountIcon
          key={`${token.chainId}-${token.address}`}
          amount={amount}
          chainId={token.chainId}
          tokenAddress={token.address}
        />
      ))}
    </>
  );
});

type YouReceiveSectionProps = {
  outputs: QuoteTokenAmount[];
  returned: QuoteTokenAmount[];
  showRefresh?: boolean;
};
const YouReceiveSection = memo(function YouReceiveSection({
  outputs,
  returned,
  showRefresh = false,
}: YouReceiveSectionProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { open, handleToggle, Icon } = useCollapse();
  const dustRowsId = useId();
  const hasReturned = returned.length > 0;
  const outputsUsdStr = useAppSelector(state =>
    totalValueOfTokenAmounts(outputs, state).toString()
  );
  const dustUsdStr = useAppSelector(state => totalValueOfTokenAmounts(returned, state).toString());
  const dustUsdFormatted = useMemo(() => formatLargeUsd(new BigNumber(dustUsdStr)), [dustUsdStr]);
  const totalUsdFormatted = useMemo(
    () => formatLargeUsd(new BigNumber(outputsUsdStr).plus(dustUsdStr)),
    [outputsUsdStr, dustUsdStr]
  );

  return (
    <div className={classes.youReceiveSection}>
      {showRefresh ?
        <QuoteTitleRefresh title={t('Transact-YouReceive')} enableRefresh={true} />
      : <div className={classes.youReceiveTitle}>{t('Transact-YouReceive')}</div>}
      <div className={classes.youReceiveCard}>
        {outputs.map(({ token, amount }) => (
          <TokenAmountIcon
            key={`${token.chainId}-${token.address}`}
            amount={amount}
            chainId={token.chainId}
            tokenAddress={token.address}
            variant="bare"
          />
        ))}
        {hasReturned ?
          <>
            <hr className={classes.youReceiveDivider} />
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
                {returned.map(({ token, amount }) => (
                  <DustTokenRow
                    key={`${token.chainId}-${token.address}`}
                    amount={amount}
                    chainId={token.chainId}
                    tokenAddress={token.address}
                  />
                ))}
              </div>
            : null}
            <hr className={classes.youReceiveDivider} />
            <div className={classes.totalRow}>
              <span className={classes.totalText}>{t('Transact-Total')}</span>
              <span className={classes.totalText}>{totalUsdFormatted}</span>
            </div>
          </>
        : null}
      </div>
    </div>
  );
});

type TokenRowProps = {
  amount: BigNumber;
  chainId: TokenEntity['chainId'];
  tokenAddress: TokenEntity['address'];
};

const DustTokenRow = memo(function DustTokenRow({ amount, chainId, tokenAddress }: TokenRowProps) {
  const classes = useStyles();
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = amount.multipliedBy(tokenPrice);

  return (
    <div className={classes.dustRow}>
      <div className={classes.dustRowAmountGroup}>
        <TokenAmount amount={amount} decimals={token.decimals} css={styles.dustRowAmount} />
        <span className={classes.dustRowValue}>{formatLargeUsd(valueInUsd)}</span>
      </div>
      <div className={classes.dustRowTokenInfo}>
        <span className={classes.dustRowTokenName}>{token.symbol}</span>
        <TokensImageWithChain tokens={[token]} chainId={token.chainId} size={24} />
      </div>
    </div>
  );
});

type LpSharePrimaryRowProps = TokenRowProps & {
  vaultId: VaultEntity['id'];
};
const LpSharePrimaryRow = memo(function LpSharePrimaryRow({
  amount,
  chainId,
  tokenAddress,
  vaultId,
}: LpSharePrimaryRowProps) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = amount.multipliedBy(tokenPrice);

  return (
    <div className={classes.clmPrimaryRow}>
      <div className={classes.clmPrimaryAmounts}>
        <TokenAmount amount={amount} decimals={token.decimals} css={styles.clmPrimaryAmount} />
        <span className={classes.clmPrimaryValue}>{formatLargeUsd(valueInUsd)}</span>
      </div>
      <div className={classes.clmPrimaryTokens}>
        <span className={classes.clmPrimarySymbol}>{token.symbol}</span>
        <AssetsImageWithChain chainId={chainId} assetSymbols={vault.assetIds} size={24} />
      </div>
    </div>
  );
});

type CowcentratedYouReceiveSectionProps = {
  quote:
    | CowcentratedVaultDepositQuote
    | CowcentratedZapDepositQuote
    | CowcentratedDualZapDepositQuote;
  returned: QuoteTokenAmount[];
  showRefresh?: boolean;
};
const CowcentratedYouReceiveSection = memo(function CowcentratedYouReceiveSection({
  quote,
  returned,
  showRefresh = false,
}: CowcentratedYouReceiveSectionProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { open, handleToggle, Icon } = useCollapse();
  const dustRowsId = useId();
  const hasReturned = returned.length > 0;

  const vaultId = quote.option.vaultId;
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const shares = quote.outputs[0];

  const outputs = useMemo(() => [shares], [shares]);
  const outputsUsdStr = useAppSelector(state =>
    totalValueOfTokenAmounts(outputs, state).toString()
  );
  const dustUsdStr = useAppSelector(state => totalValueOfTokenAmounts(returned, state).toString());
  const dustUsdFormatted = useMemo(() => formatLargeUsd(new BigNumber(dustUsdStr)), [dustUsdStr]);
  const totalUsdFormatted = useMemo(
    () => formatLargeUsd(new BigNumber(outputsUsdStr).plus(dustUsdStr)),
    [outputsUsdStr, dustUsdStr]
  );

  return (
    <div className={classes.youReceiveSection}>
      {showRefresh ?
        <QuoteTitleRefresh title={t('Transact-YouReceive')} enableRefresh={true} />
      : <div className={classes.youReceiveTitle}>{t('Transact-YouReceive')}</div>}
      <div className={classes.youReceiveCard}>
        <LpSharePrimaryRow
          amount={shares.amount}
          chainId={shares.token.chainId}
          tokenAddress={vault.depositTokenAddress}
          vaultId={vaultId}
        />
        <hr className={classes.youReceiveDivider} />
        <div className={classes.clmPositionGrid}>
          {quote.position.map((pos, i) => (
            <Fragment key={`${pos.token.chainId}-${pos.token.address}`}>
              {i > 0 ?
                <div className={classes.clmPositionCellDivider} />
              : null}
              <ClmPositionCell
                amount={pos.amount}
                chainId={pos.token.chainId}
                tokenAddress={pos.token.address}
              />
            </Fragment>
          ))}
        </div>
        {hasReturned ?
          <>
            <hr className={classes.youReceiveDivider} />
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
                {returned.map(({ token, amount }) => (
                  <DustTokenRow
                    key={`${token.chainId}-${token.address}`}
                    amount={amount}
                    chainId={token.chainId}
                    tokenAddress={token.address}
                  />
                ))}
              </div>
            : null}
            <hr className={classes.youReceiveDivider} />
            <div className={classes.totalRow}>
              <span className={classes.totalText}>{t('Transact-Total')}</span>
              <span className={classes.totalText}>{totalUsdFormatted}</span>
            </div>
          </>
        : null}
      </div>
    </div>
  );
});

const ClmPositionCell = memo(function ClmPositionCell({
  amount,
  chainId,
  tokenAddress,
}: TokenRowProps) {
  const classes = useStyles();
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = amount.multipliedBy(tokenPrice);

  return (
    <div className={classes.clmPositionCell}>
      <TokensImageWithChain tokens={[token]} chainId={token.chainId} size={24} />
      <div className={classes.clmPositionCellAmounts}>
        <TokenAmount amount={amount} decimals={token.decimals} css={styles.clmPositionCellAmount} />
        <span className={classes.clmPositionCellValue}>{formatLargeUsd(valueInUsd)}</span>
      </div>
    </div>
  );
});
