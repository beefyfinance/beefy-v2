import { css, type CssStyles } from '@repo/styles/css';
import BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { Fragment, memo, type ReactNode, useEffect, useId, useMemo } from 'react';
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
  transactFetchQuotesIfNeeded,
} from '../../../../../data/actions/transact.ts';
import { totalValueOfTokenAmounts } from '../../../../../data/apis/transact/helpers/quotes.ts';
import {
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import {
  type CowcentratedVaultDepositQuote,
  type CowcentratedZapDepositQuote,
  type CowcentratedDualZapDepositQuote,
  isCowcentratedDepositQuote,
  isCrossChainDepositQuote,
  isCrossChainWithdrawQuote,
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
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens.ts';
import {
  selectTransactInputAmounts,
  selectTransactInputMaxes,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactSelectedQuote,
  selectTransactSelectedSelectionId,
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
  const debouncedFetchQuotes = useMemo(
    () =>
      debounce(
        (dispatch: ReturnType<typeof useAppDispatch>, inputAmounts: BigNumber[]) => {
          if (inputAmounts.every(amount => amount.lte(BIG_ZERO))) {
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
    debouncedFetchQuotes(dispatch, inputAmounts);
  }, [
    dispatch,
    mode,
    chainId,
    selectionId,
    selection,
    inputAmounts,
    inputMaxes,
    debouncedFetchQuotes,
  ]);

  if (status === TransactStatus.Idle) {
    return <QuoteIdle title={title} css={cssProp} />;
  }

  return (
    <div className={css(cssProp)}>
      {status === TransactStatus.Fulfilled ?
        <QuoteFulfilled title={title} mode={mode} />
      : <>
          <QuoteTitleRefresh title={title} enableRefresh={status === TransactStatus.Rejected} />
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

const QuoteFulfilled = memo(function QuoteFulfilled({
  title,
  mode,
}: {
  title: string;
  mode: TransactMode;
}) {
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isCrossChain = isCrossChainDepositQuote(quote);
  const effectiveQuote =
    isCrossChain ? quote.destQuote
    : isCrossChainWithdrawQuote(quote) ? quote.sourceWithdrawQuote
    : quote;
  const isDeposit = mode === TransactMode.Deposit;
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
  const showTitle = isCowcentratedDeposit || !isDeposit || !hasTransformation;

  return (
    <>
      {showTitle ?
        <QuoteTitleRefresh title={title} enableRefresh={true} />
      : null}
      <QuoteLoaded
        quote={quote}
        effectiveQuote={effectiveQuote}
        hasTransformation={hasTransformation}
        isDeposit={isDeposit}
        showTitle={showTitle}
      />
    </>
  );
});

const QuoteIdle = memo(function QuoteIdle({ title, css: cssProp }: TransactQuoteProps) {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={css(styles.disabled, cssProp)}>
      <QuoteTitleRefresh title={title} enableRefresh={true} />
      <div className={classes.tokenAmounts}>
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
    </div>
  );
});

const QuoteError = memo(function QuoteError() {
  const classes = useStyles();
  const { t } = useTranslation();
  const error = useAppSelector(selectTransactQuoteError);
  const mode = useAppSelector(selectTransactMode);
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  if (error) {
    if (QuoteCowcentratedNoSingleSideError.match(error)) {
      return (
        <AlertError>
          {t('Transact-Notice-CowcentratedNoSingleSideAllowed', {
            inputToken: error.inputToken,
            neededToken: error.neededToken,
          })}
        </AlertError>
      );
    } else if (QuoteCowcentratedNotCalmError.match(error)) {
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

    const isCrossChain = selectedChainId && selectedChainId !== vault.chainId;
    if (isCrossChain && error.message?.includes('0 input amount')) {
      const action = mode === TransactMode.Deposit ? 'deposit' : 'withdraw';
      return <AlertError>{t(`Transact-Quote-Error-CrossChain-TooLow-${action}`)}</AlertError>;
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
  isDeposit: boolean;
  showTitle?: boolean;
  showRouteBlocks?: boolean;
};
export const QuoteLoaded = memo(function QuoteLoaded({
  quote,
  effectiveQuote,
  hasTransformation,
  isDeposit,
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
  const isLpBreakWithdraw = !isDeposit && quote.outputs.length === 2 && quote.inputs.length === 1;

  let topCard: ReactNode = null;
  if (cowcentratedDepositQuote) {
    topCard = (
      <div className={classes.amountReturned}>
        {cowcentratedDepositQuote.used.map(used => (
          <TokenAmountIcon
            key={used.token.id}
            amount={used.amount}
            chainId={used.token.chainId}
            tokenAddress={used.token.address}
            showSymbol={false}
            css={styles.fullWidth}
            amountWithValueCss={styles.alignItemsEnd}
          />
        ))}
      </div>
    );
  } else if (isLpBreakWithdraw) {
    topCard = (
      <div className={classes.youReceiveCard}>
        <LpSharePrimaryRow
          amount={quote.inputs[0].amount}
          chainId={quote.inputs[0].token.chainId}
          tokenAddress={quote.inputs[0].token.address}
          vaultId={quote.option.vaultId}
        />
      </div>
    );
  } else if (!hasTransformation) {
    topCard = <TokenAmountList items={quote.outputs} />;
  } else if (!isDeposit) {
    topCard = <TokenAmountList items={quote.inputs} />;
  }

  return (
    <>
      {topCard ?
        <div className={classes.tokenAmounts}>{topCard}</div>
      : null}
      {cowcentratedDepositQuote ?
        <CowcentratedYouReceiveSection quote={cowcentratedDepositQuote} returned={returned} />
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
              aria-controls={dustRowsId}
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
};
const CowcentratedYouReceiveSection = memo(function CowcentratedYouReceiveSection({
  quote,
  returned,
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
      <div className={classes.youReceiveTitle}>{t('Transact-YouReceive')}</div>
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
              aria-controls={dustRowsId}
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
