import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent, formatPercentTrim, formatUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCrossChainQuote,
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
      const fastFeeDecimal = fastFeeBps != null ? (fastFeeBps * 1.15) / 10000 : undefined;
      const combinedFee = fastFeeDecimal != null ? fee.value + fastFeeDecimal : fee.value;
      const percentText = formatPercentTrim(combinedFee);
      const bridgePrefix = bridgeFeeUsd != null ? `${formatUsd(bridgeFeeUsd, 2)} + ` : '';
      const hasMultipleFees = bridgeFeeUsd != null || fastFeeDecimal != null;
      const crossChainFees: CrossChainFees = {
        fastFeeDecimal,
        relayFeeUsd: bridgeFeeUsd,
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
    <TooltipTable>
      <TooltipRows>
        {crossChainFees?.relayFeeUsd != null && (
          <TooltipRow>
            <TooltipLabel>{t('Transact-Fee-Zap-Row-Relay')}</TooltipLabel>
            <TooltipValue>
              {t('Transact-Fee-Zap-Row-Relay-Desc', {
                amount: formatUsd(crossChainFees.relayFeeUsd, 2),
              })}
            </TooltipValue>
          </TooltipRow>
        )}
        {crossChainFees?.fastFeeDecimal != null && (
          <TooltipRow>
            <TooltipLabel>{t('Transact-Fee-Zap-Row-Bridge')}</TooltipLabel>
            <TooltipValue>
              {t('Transact-Fee-Zap-Row-Bridge-Desc', {
                percent: formatPercentTrim(crossChainFees.fastFeeDecimal),
              })}
            </TooltipValue>
          </TooltipRow>
        )}
        <TooltipRow>
          <TooltipLabel>{t('Transact-Fee-Zap-Row-Swap')}</TooltipLabel>
          <TooltipValue>
            {t('Transact-Fee-Zap-Row-Swap-Desc', { percent: formatPercent(fee.value) })}
          </TooltipValue>
        </TooltipRow>
      </TooltipRows>
      <TooltipFooter>{t('Transact-Fee-Zap-Footer')}</TooltipFooter>
    </TooltipTable>
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

const TooltipTable = styled('div', {
  base: {
    display: 'table',
  },
});

const TooltipRows = styled('div', {
  base: {
    display: 'table',
    borderSpacing: '0 2px',
  },
});

const TooltipRow = styled('div', {
  base: {
    display: 'table-row',
  },
});

const TooltipLabel = styled('span', {
  base: {
    display: 'table-cell',
    fontWeight: 500,
    paddingRight: '16px',
    whiteSpace: 'nowrap',
  },
});

const TooltipValue = styled('span', {
  base: {
    display: 'table-cell',
  },
});

const TooltipFooter = styled('div', {
  base: {
    display: 'table-caption',
    captionSide: 'bottom',
    paddingTop: '12px',
    marginTop: '8px',
    borderTop: '1px solid rgba(0,0,0,0.1)',
    whiteSpace: 'normal',
  },
});
