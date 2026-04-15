import { css, type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { memo, type ReactNode, useEffect, useId, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { useCollapse } from '../../../../../../components/Collapsable/hooks.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { totalValueOfTokenAmounts } from '../../../../../data/apis/transact/helpers/quotes.ts';
import {
  transactClearQuotes,
  transactFetchQuotesIfNeeded,
} from '../../../../../data/actions/transact.ts';
import {
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import {
  type CowcentratedVaultDepositQuote,
  type CowcentratedZapDepositQuote,
  isCowcentratedDepositQuote,
  isZapQuote,
  quoteNeedsSlippage,
  type TokenAmount as QuoteTokenAmount,
} from '../../../../../data/apis/transact/transact-types.ts';
import type { TokenEntity } from '../../../../../data/entities/token.ts';
import { isCowcentratedLikeVault } from '../../../../../data/entities/vault.ts';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
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
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { TokensImageWithChain } from '../../../../../../components/TokenImage/TokenImage.tsx';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens.ts';
import { QuoteTitleRefresh } from '../QuoteTitleRefresh/QuoteTitleRefresh.tsx';
import { TokenAmountIcon, TokenAmountIconLoader } from '../TokenAmountIcon/TokenAmountIcon.tsx';
import { ZapRoute } from '../ZapRoute/ZapRoute.tsx';
import { ZapSlippage } from '../ZapSlippage/ZapSlippage.tsx';
import { styles } from './styles.ts';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';

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
  const isDeposit = mode === TransactMode.Deposit;
  const isCowcentratedDeposit = isCowcentratedDepositQuote(quote);
  const hasTransformation = useMemo(() => {
    if (isCowcentratedDeposit) return false;
    if (quote.returned.some(r => r.amount.gt(BIG_ZERO))) return true;
    if (quote.outputs.length > 1) return true;
    const firstInput = quote.inputs[0];
    const firstOutput = quote.outputs[0];
    if (!firstInput || !firstOutput) return false;
    return (
      firstInput.token.address !== firstOutput.token.address ||
      firstInput.token.chainId !== firstOutput.token.chainId
    );
  }, [quote, isCowcentratedDeposit]);
  const showTitle = isCowcentratedDeposit || !isDeposit || !hasTransformation;

  return (
    <>
      {showTitle ?
        <QuoteTitleRefresh title={title} enableRefresh={true} />
      : null}
      <QuoteLoaded hasTransformation={hasTransformation} isDeposit={isDeposit} />
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

const QuoteLoaded = memo(function QuoteLoaded({
  hasTransformation,
  isDeposit,
}: {
  hasTransformation: boolean;
  isDeposit: boolean;
}) {
  const classes = useStyles();
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isZap = isZapQuote(quote);
  const needsSlippage = quoteNeedsSlippage(quote);
  const returned = useMemo(
    () => quote.returned.filter(r => r.amount.gt(BIG_ZERO)),
    [quote.returned]
  );
  const isCowcentratedDeposit = isCowcentratedDepositQuote(quote);

  let topCard: ReactNode = null;
  if (isCowcentratedDepositQuote(quote)) {
    topCard = <CowcentratedLoadedQuote quote={quote} />;
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
      {!isCowcentratedDeposit && hasTransformation ?
        <YouReceiveSection outputs={quote.outputs} returned={returned} />
      : null}
      {isZap ?
        <ZapRoute quote={quote} css={styles.route} />
      : null}
      {needsSlippage ?
        <ZapSlippage css={styles.slippage} />
      : null}
    </>
  );
});

const TokenAmountList = memo(function TokenAmountList({
  items,
}: {
  items: ReadonlyArray<QuoteTokenAmount>;
}) {
  return (
    <>
      {items.map(({ token, amount }) => (
        <TokenAmountIcon
          key={token.address}
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
};
const YouReceiveSection = memo(function YouReceiveSection({
  outputs,
  returned,
}: YouReceiveSectionProps) {
  const { t } = useTranslation();
  const { open, handleToggle, Icon } = useCollapse();
  const dustRowsId = useId();
  const hasReturned = returned.length > 0;
  const dustUsdFormatted = useAppSelector(state =>
    formatLargeUsd(totalValueOfTokenAmounts(returned, state))
  );
  const totalUsdFormatted = useAppSelector(state =>
    formatLargeUsd(
      totalValueOfTokenAmounts(outputs, state).plus(totalValueOfTokenAmounts(returned, state))
    )
  );

  return (
    <div className={css(styles.youReceiveSection)}>
      <div className={css(styles.youReceiveTitle)}>{t('Transact-YouReceive')}</div>
      <div className={css(styles.youReceiveCard)}>
        {outputs.map(({ token, amount }) => (
          <TokenAmountIcon
            key={`${token.chainId}-${token.address}`}
            amount={amount}
            chainId={token.chainId}
            tokenAddress={token.address}
            css={styles.youReceiveMainRow}
          />
        ))}
        {hasReturned ?
          <>
            <hr className={css(styles.youReceiveDivider)} />
            <button
              type="button"
              className={css(styles.dustToggle)}
              onClick={handleToggle}
              aria-expanded={open}
              aria-controls={dustRowsId}
            >
              <span className={css(styles.dustToggleLabel)}>
                {t('Transact-Returned', { dustValue: dustUsdFormatted })}
              </span>
              <span className={css(styles.dustToggleChevron)}>
                <Icon />
              </span>
            </button>
            {open ?
              <div id={dustRowsId} className={css(styles.dustRows)}>
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
            <hr className={css(styles.youReceiveDivider)} />
            <div className={css(styles.totalRow)}>
              <span className={css(styles.totalLabel)}>{t('Transact-Total')}</span>
              <span className={css(styles.totalValue)}>{totalUsdFormatted}</span>
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
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, tokenAddress));
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, chainId, tokenAddress)
  );
  const valueInUsd = useMemo(() => amount.multipliedBy(tokenPrice), [amount, tokenPrice]);

  return (
    <div className={css(styles.dustRow)}>
      <div className={css(styles.dustRowAmountGroup)}>
        <TokenAmount amount={amount} decimals={token.decimals} css={styles.dustRowAmount} />
        <span className={css(styles.dustRowValue)}>{formatLargeUsd(valueInUsd)}</span>
      </div>
      <div className={css(styles.dustRowTokenInfo)}>
        <span className={css(styles.dustRowTokenName)}>{token.symbol}</span>
        <TokensImageWithChain tokens={[token]} chainId={token.chainId} size={24} />
      </div>
    </div>
  );
});

export const CowcentratedLoadedQuote = memo(function CowcentratedLoadedQuote({
  quote,
}: {
  quote: CowcentratedVaultDepositQuote | CowcentratedZapDepositQuote;
}) {
  const { t } = useTranslation();
  const shares = quote.outputs[0];
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const classes = useStyles();

  return (
    <div className={classes.cowcentratedDepositContainer}>
      <div className={classes.amountReturned}>
        {quote.used.map(used => {
          return (
            <TokenAmountIcon
              key={used.token.id}
              amount={used.amount}
              chainId={used.token.chainId}
              tokenAddress={used.token.address}
              showSymbol={false}
              css={styles.fullWidth}
              tokenImageSize={28}
              amountWithValueCss={styles.alignItemsEnd}
            />
          );
        })}
      </div>
      <div className={classes.label}>{t('Transact-YourPositionWillBe')}</div>
      <div className={classes.cowcentratedSharesDepositContainer}>
        <TokenAmountIcon
          key={shares.token.id}
          amount={shares.amount}
          chainId={shares.token.chainId}
          tokenAddress={vault.depositTokenAddress}
          css={styles.mainLp}
        />
        <div className={classes.amountReturned}>
          {quote.position.map((position, i) => {
            return (
              <TokenAmountIcon
                key={position.token.id}
                amount={position.amount}
                chainId={position.token.chainId}
                tokenAddress={position.token.address}
                css={css.raw(
                  styles.fullWidth,
                  i === 0 ? styles.borderRadiusToken0 : styles.borderRadiusToken1
                )}
                showSymbol={false}
                tokenImageSize={28}
                amountWithValueCss={styles.alignItemsEnd}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
