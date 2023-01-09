import { memo, useMemo } from 'react';
import { useAppSelector } from '../../../../../../store';
import {
  selectTransactOptionById,
  selectTransactSelectedQuote,
} from '../../../../../data/selectors/transact';
import {
  isZapFeeDiscounted,
  isZapQuote,
  ZapOption,
} from '../../../../../data/apis/transact/transact-types';
import { Value } from './Value';
import { Label } from './Label';
import { useTranslation } from 'react-i18next';
import { LabelTooltip } from './LabelTooltip';
import { formatSmallPercent } from '../../../../../../helpers/format';
import { makeStyles } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';

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

type MaybeZapFeesProps = {};
export const MaybeZapFees = memo<MaybeZapFeesProps>(function MaybeZapFees() {
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isZap = quote && isZapQuote(quote);

  if (!isZap) {
    return null;
  }

  return <ZapFees optionId={quote.optionId} />;
});

type ZapFeesProps = {
  optionId: ZapOption['id'];
};
const ZapFees = memo<ZapFeesProps>(function ZapFees({ optionId }) {
  const { t, i18n } = useTranslation();
  // we can assert the option is a ZapOption because we pass an optionId from a ZapQuote
  const option = useAppSelector(state => selectTransactOptionById(state, optionId)) as ZapOption;
  const classes = useStyles();
  const providerId = option.providerId;
  const fee = option.fee;
  const hasDiscountFee = isZapFeeDiscounted(fee);
  const content = useMemo(() => {
    const hierarchy = hasDiscountFee
      ? [
          `Transact-Fee-Zap-Explainer-Discount-${providerId}`,
          `Transact-Fee-Zap-Explainer-${providerId}`,
        ]
      : `Transact-Fee-Zap-Explainer-${providerId}`;

    return i18n.exists(hierarchy) ? t(hierarchy) : undefined;
  }, [t, i18n, providerId, hasDiscountFee]);

  return (
    <>
      <Label>
        {t('Transact-Fee-Zap')}{' '}
        <LabelTooltip title={t('Transact-Fee-Zap-Explainer')} content={content} />
      </Label>
      <Value>
        {hasDiscountFee ? (
          <>
            <span className={classes.discounted}>
              {formatSmallPercent(fee.discounted, 2, 2, true)}
            </span>
            <span className={classes.original}>{formatSmallPercent(fee.original, 2, 2, true)}</span>
          </>
        ) : (
          formatSmallPercent(fee)
        )}
      </Value>
    </>
  );
});
