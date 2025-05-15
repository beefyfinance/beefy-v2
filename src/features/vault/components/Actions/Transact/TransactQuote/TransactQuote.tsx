import { css, type CssStyles } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { memo, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
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
} from '../../../../../data/apis/transact/transact-types.ts';
import { isCowcentratedLikeVault } from '../../../../../data/entities/vault.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
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
      <QuoteTitleRefresh
        title={title}
        enableRefresh={status === TransactStatus.Fulfilled || status === TransactStatus.Rejected}
      />
      {status === TransactStatus.Pending ?
        <QuoteLoading />
      : null}
      {status === TransactStatus.Fulfilled ?
        <QuoteLoaded />
      : null}
      {status === TransactStatus.Rejected ?
        <QuoteError />
      : null}
    </div>
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
                <a
                  className={classes.link}
                  href={'https://docs.beefy.finance/beefy-products/clm#calmness-check'}
                  target="_blank"
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

const QuoteLoaded = memo(function QuoteLoaded() {
  // const { t } = useTranslation();
  const classes = useStyles();
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isZap = isZapQuote(quote);
  const needsSlippage = quoteNeedsSlippage(quote);

  return (
    <>
      <div className={classes.tokenAmounts}>
        {isCowcentratedDepositQuote(quote) ?
          <CowcentratedLoadedQuote quote={quote} />
        : <>
            {quote.outputs.map(({ token, amount }) => (
              <TokenAmountIcon
                key={token.address}
                amount={amount}
                chainId={token.chainId}
                tokenAddress={token.address}
              />
            ))}
          </>
        }
      </div>
      {/*      {quote.returned.length ? (
            <div className={classes.returned}>
              <div className={classes.returnedTitle}>{t('Transact-Returned')}</div>
              <div className={classes.tokenAmounts}>
                {quote.returned.map(({ token, amount }) => (
                  <TokenAmountIcon
                    key={token.address}
                    amount={amount}
                    chainId={token.chainId}
                    tokenAddress={token.address}
                  />
                ))}
              </div>
            </div>
          ) : null}*/}
      {isZap ?
        <ZapRoute quote={quote} css={styles.route} />
      : null}
      {needsSlippage ?
        <ZapSlippage css={styles.slippage} />
      : null}
    </>
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
      <div className={classes.label}>{t('Your Position Will Be')}</div>
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
