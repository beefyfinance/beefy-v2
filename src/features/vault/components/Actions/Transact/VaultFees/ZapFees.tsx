import { css } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent, formatUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCrossChainQuote,
  isCrossChainWithdrawQuote,
  isZapFeeDiscounted,
  isZapQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { selectTransactSelectedQuoteOrUndefined } from '../../../../../data/selectors/transact.ts';
import { CCTP_CONFIG } from '../../../../../../config/cctp/cctp-config.ts';
import { Label } from './Label.tsx';
import { LabelCustomTooltip } from './LabelTooltip.tsx';
import { Value } from './Value.tsx';

const useStyles = legacyMakeStyles({
  original: css.raw({
    color: 'text.dark',
    textDecoration: 'line-through',
  }),
  discounted: css.raw({
    color: 'text.light',
    background: 'zapDiscountedFeesBackground',
    padding: '0 4px',
    borderRadius: '4px',
    marginRight: '10px',
  }),
});

export const MaybeZapFees = memo(function MaybeZapFees() {
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const isZap = quote && isZapQuote(quote);

  if (!isZap) {
    return null;
  }

  return <ZapFees quote={quote} />;
});

type ZapFeesProps = {
  quote: ZapQuote;
};

type CrossChainFees = {
  fastFeeDecimal: number | undefined;
  relayFeeUsd: number | undefined;
};

const ZapFees = memo(function ZapFees({ quote }: ZapFeesProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { fee } = quote;
  const hasDiscountFee = isZapFeeDiscounted(fee);
  const isCrossChain = isCrossChainQuote(quote);

  const { zapFeeText, hasMultipleFees, crossChainFees } = useMemo(() => {
    if (isCrossChain) {
      const sourceChainId = quote.option.sourceChainId;
      const destChainId = quote.option.destChainId;
      const destChainConfig = destChainId ? CCTP_CONFIG.chains[destChainId] : undefined;
      const sourceChainConfig = sourceChainId ? CCTP_CONFIG.chains[sourceChainId] : undefined;
      const bridgeFeeUsd = destChainConfig?.beefyBridgeFeeUsd;
      const fastFeeBps = sourceChainConfig?.fastFeeBps;
      const isWithdrawToUsdc = isCrossChainWithdrawQuote(quote) && quote.destSteps.length === 0;
      const showBridge = bridgeFeeUsd != null && !isWithdrawToUsdc;
      const fastFeeDecimal = fastFeeBps != null ? (fastFeeBps * 1.15) / 10000 : undefined;
      const combinedFee = fastFeeDecimal != null ? fee.value + fastFeeDecimal : fee.value;
      const percentText = formatPercent(combinedFee, 3);
      const bridgePrefix = showBridge ? `${formatUsd(bridgeFeeUsd, 2)} + ` : '';
      const hasMultipleFees = showBridge || fastFeeDecimal != null;
      const crossChainFees: CrossChainFees = {
        fastFeeDecimal,
        relayFeeUsd: showBridge ? bridgeFeeUsd : undefined,
      };
      return { zapFeeText: bridgePrefix + percentText, hasMultipleFees, crossChainFees };
    }
    if (hasDiscountFee)
      return { zapFeeText: null, hasMultipleFees: false, crossChainFees: undefined };
    return {
      zapFeeText: formatPercent(fee.value),
      hasMultipleFees: false,
      crossChainFees: undefined,
    };
  }, [quote, isCrossChain, hasDiscountFee, fee.value]);

  const tooltip = (
    <div style={{ display: 'table' }}>
      <div style={{ display: 'table', borderSpacing: '0 2px' }}>
        {crossChainFees?.relayFeeUsd != null && (
          <div style={{ display: 'table-row' }}>
            <span
              style={{
                display: 'table-cell',
                fontWeight: 500,
                paddingRight: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {t('Transact-Fee-Zap-Row-Relay')}
            </span>
            <span style={{ display: 'table-cell' }}>
              {t('Transact-Fee-Zap-Row-Relay-Desc', {
                amount: formatUsd(crossChainFees.relayFeeUsd, 2),
              })}
            </span>
          </div>
        )}
        {crossChainFees?.fastFeeDecimal != null && (
          <div style={{ display: 'table-row' }}>
            <span
              style={{
                display: 'table-cell',
                fontWeight: 500,
                paddingRight: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              {t('Transact-Fee-Zap-Row-Bridge')}
            </span>
            <span style={{ display: 'table-cell' }}>
              {t('Transact-Fee-Zap-Row-Bridge-Desc', {
                percent: formatPercent(crossChainFees.fastFeeDecimal, 3),
              })}
            </span>
          </div>
        )}
        <div style={{ display: 'table-row' }}>
          <span
            style={{
              display: 'table-cell',
              fontWeight: 500,
              paddingRight: '16px',
              whiteSpace: 'nowrap',
            }}
          >
            {t('Transact-Fee-Zap-Row-Swap')}
          </span>
          <span style={{ display: 'table-cell' }}>
            {t('Transact-Fee-Zap-Row-Swap-Desc', { percent: formatPercent(fee.value) })}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'table-caption',
          captionSide: 'bottom',
          paddingTop: '12px',
          marginTop: '8px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          whiteSpace: 'normal',
        }}
      >
        {t('Transact-Fee-Zap-Footer')}
      </div>
    </div>
  );

  return (
    <>
      <Label>
        {t(hasMultipleFees ? 'Transact-Fee-Zap-Multiple' : 'Transact-Fee-Zap')}{' '}
        <LabelCustomTooltip tooltip={tooltip} />
      </Label>
      <Value>
        {zapFeeText != null ?
          zapFeeText
        : hasDiscountFee ?
          <>
            <span className={classes.discounted}>{formatPercent(fee.value, 2)}</span>
            <span className={classes.original}>{formatPercent(fee.original, 2)}</span>
          </>
        : formatPercent(fee.value)}
      </Value>
    </>
  );
});
