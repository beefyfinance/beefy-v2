import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { formatLargePercent } from '../../../../../../helpers/format.ts';
import type { TransactQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCowcentratedDepositQuote,
  isZapQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { type CssStyles } from '@repo/styles/css';

const IMPACT_WARN_PERCENT = 1 / 100;
const IMPACT_CONFIRM_PERCENT = 5 / 100;

export type PriceImpactNoticeProps = {
  quote: TransactQuote;
  onChange: (shouldDisable: boolean) => void;
  hideCheckbox?: boolean;
  css?: CssStyles;
};
export const PriceImpactNotice = memo(function PriceImpactNotice({
  quote,
  onChange,
  css: cssProp,
  hideCheckbox = false,
}: PriceImpactNoticeProps) {
  const { t } = useTranslation();
  const [shouldWarn, setShouldWarn] = useState(false);
  const [shouldConfirm, setShouldConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const AlertComponent = shouldConfirm ? AlertError : AlertWarning;
  const isZap = isZapQuote(quote);
  const priceImpact = isZap ? quote.priceImpact : 0;
  const isInvalidCowcentratedDeposit =
    isCowcentratedDepositQuote(quote) && quote.outputs.every(quote => quote.amount.lte(BIG_ZERO));

  useEffect(() => {
    if (isZap && priceImpact >= IMPACT_WARN_PERCENT) {
      setShouldWarn(true);
      if (priceImpact >= IMPACT_CONFIRM_PERCENT) {
        setShouldConfirm(true);
        setConfirmed(false);
      } else {
        setShouldConfirm(false);
        setConfirmed(false);
      }
    } else {
      setShouldWarn(false);
      setShouldConfirm(false);
      setConfirmed(false);
    }
    if (isInvalidCowcentratedDeposit) {
      setShouldWarn(false);
      setShouldConfirm(false);
      setConfirmed(false);
    }
  }, [
    isZap,
    priceImpact,
    setShouldWarn,
    setShouldConfirm,
    setConfirmed,
    isInvalidCowcentratedDeposit,
  ]);

  useEffect(() => {
    onChange(shouldConfirm && !confirmed);
  }, [shouldConfirm, confirmed, onChange]);

  if (!isZap || !shouldWarn) {
    return null;
  }

  return (
    <AlertComponent css={cssProp}>
      <p>
        {t('Transact-Notice-PriceImpact', {
          priceImpact: formatLargePercent(-priceImpact, 2, '0.00%'),
        })}
      </p>
      {shouldConfirm && !hideCheckbox ?
        <LabelledCheckbox
          onChange={setConfirmed}
          checked={confirmed}
          label={t('Transact-Notice-PriceImpact-Confirm')}
        />
      : null}
    </AlertComponent>
  );
});
