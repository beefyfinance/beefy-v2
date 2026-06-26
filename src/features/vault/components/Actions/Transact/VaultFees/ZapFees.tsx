import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { formatPercent, formatPercentTrim, formatUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TransactOption, ZapFee } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCrossChainOption,
  isZapFeeDiscounted,
} from '../../../../../data/apis/transact/transact-types.ts';
import { selectTransactSelectedZapFee } from '../../../../../data/selectors/transact.ts';
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
  const ctx = useAppSelector(selectTransactSelectedZapFee);

  if (!ctx) {
    return null;
  }

  return <ZapFees option={ctx.option} fee={ctx.fee} />;
});

type ZapFeesProps = {
  option: TransactOption;
  fee: ZapFee;
};

type CrossChainFees = {
  fastFeeDecimal: number | undefined;
  relayFeeUsd: number | undefined;
};

type FeeDisplay = {
  prefix: string;
  current: string;
  original?: string;
};

const ZapFees = memo(function ZapFees({ option, fee }: ZapFeesProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const hasDiscountFee = isZapFeeDiscounted(fee);
  const isCrossChain = isCrossChainOption(option);

  const { display, hasMultipleFees, crossChainFees } = useMemo(() => {
    if (isCrossChain) {
      const sourceChainId = option.sourceChainId;
      const destChainId = option.destChainId;
      const destChainConfig = destChainId ? CCTP_CONFIG.chains[destChainId] : undefined;
      const sourceChainConfig = sourceChainId ? CCTP_CONFIG.chains[sourceChainId] : undefined;
      const bridgeFeeUsd = destChainConfig?.beefyBridgeFeeUsd;
      const fastFeeBps = sourceChainConfig?.fastFeeBps;
      const fastFeeDecimal = fastFeeBps != null ? (fastFeeBps * 1.15) / 10000 : undefined;
      const withFastFee = (zapValue: number) =>
        fastFeeDecimal != null ? zapValue + fastFeeDecimal : zapValue;
      const bridgePrefix = bridgeFeeUsd != null ? `${formatUsd(bridgeFeeUsd, 2)} + ` : '';
      const hasMultipleFees = bridgeFeeUsd != null || fastFeeDecimal != null;
      const crossChainFees: CrossChainFees = {
        fastFeeDecimal,
        relayFeeUsd: bridgeFeeUsd,
      };
      // Original strikes the combined total (zap + fast), not the zap fee alone.
      const display: FeeDisplay = {
        prefix: bridgePrefix,
        current: formatPercentTrim(withFastFee(fee.value)),
        original:
          hasDiscountFee ? formatPercentTrim(withFastFee(fee.campaign.original)) : undefined,
      };
      return { display, hasMultipleFees, crossChainFees };
    }
    if (hasDiscountFee) {
      return {
        display: {
          prefix: '',
          current: formatPercent(fee.value, 2),
          original: formatPercent(fee.campaign.original, 2),
        } satisfies FeeDisplay,
        hasMultipleFees: false,
        crossChainFees: undefined,
      };
    }
    return {
      display: { prefix: '', current: formatPercent(fee.value) } satisfies FeeDisplay,
      hasMultipleFees: false,
      crossChainFees: undefined,
    };
  }, [option, isCrossChain, hasDiscountFee, fee.value, fee.campaign?.original]);

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
          <TooltipLabel>{t('Transact-Fee-Zap-Row-Zap')}</TooltipLabel>
          <TooltipValue>
            {hasDiscountFee ?
              <Trans
                t={t}
                i18nKey="Transact-Fee-Zap-Row-Zap-Desc-Discounted"
                values={{
                  percent: formatPercent(fee.value),
                  original: formatPercent(fee.campaign.original),
                }}
                components={{ Original: <span className={classes.original} /> }}
              />
            : t('Transact-Fee-Zap-Row-Zap-Desc', { percent: formatPercent(fee.value) })}
          </TooltipValue>
        </TooltipRow>
      </TooltipRows>
    </TooltipTable>
  );

  return (
    <>
      <Label>
        {t(hasMultipleFees ? 'Transact-Fee-Zap-Multiple' : 'Transact-Fee-Zap')}{' '}
        <LabelCustomTooltip tooltip={tooltip} />
      </Label>
      <Value>
        {display.prefix}
        {display.original != null ?
          <>
            <span className={classes.discounted}>{display.current}</span>
            <span className={classes.original}>{display.original}</span>
          </>
        : display.current}
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
