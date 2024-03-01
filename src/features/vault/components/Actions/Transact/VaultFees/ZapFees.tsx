import { memo } from 'react';
import { useAppSelector } from '../../../../../../store';
import { selectTransactSelectedQuoteOrUndefined } from '../../../../../data/selectors/transact';
import type { ZapQuote } from '../../../../../data/apis/transact/transact-types';
import { isZapFeeDiscounted, isZapQuote } from '../../../../../data/apis/transact/transact-types';
import { Value } from './Value';
import { Label } from './Label';
import { useTranslation } from 'react-i18next';
import { LabelTooltip } from './LabelTooltip';
import { formatSmallPercent } from '../../../../../../helpers/format';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  original: {
    color: theme.palette.text.dark,
    textDecoration: 'line-through' as const,
  },
  discounted: {
    color: theme.palette.text.light,
    background: '#59A662',
    padding: '0 4px',
    borderRadius: '4px',
    marginRight: '10px',
  },
}));

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
const ZapFees = memo<ZapFeesProps>(function ZapFees({ quote }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { fee } = quote;
  const hasDiscountFee = isZapFeeDiscounted(fee);

  return (
    <>
      <Label>
        {t('Transact-Fee-Zap')} <LabelTooltip title={t('Transact-Fee-Zap-Explainer')} />
      </Label>
      <Value>
        {hasDiscountFee ? (
          <>
            <span className={classes.discounted}>{formatSmallPercent(fee.value, 2, 2, true)}</span>
            <span className={classes.original}>{formatSmallPercent(fee.original, 2, 2, true)}</span>
          </>
        ) : (
          formatSmallPercent(fee.value)
        )}
      </Value>
    </>
  );
});
