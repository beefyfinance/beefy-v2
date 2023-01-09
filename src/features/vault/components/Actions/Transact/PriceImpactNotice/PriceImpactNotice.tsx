import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox';
import { formatPercent } from '../../../../../../helpers/format';
import { isZapQuote, TransactQuote } from '../../../../../data/apis/transact/transact-types';

const IMPACT_WARN_PERCENT = 1 / 100;
const IMPACT_CONFIRM_PERCENT = 5 / 100;

export type PriceImpactNoticeProps = {
  quote: TransactQuote;
  onChange: (shouldDisable: boolean) => void;
  className?: string;
};
export const PriceImpactNotice = memo<PriceImpactNoticeProps>(function PriceImpactNotice({
  quote,
  onChange,
  className,
}) {
  const { t } = useTranslation();
  const [shouldWarn, setShouldWarn] = useState(false);
  const [shouldConfirm, setShouldConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const AlertComponent = shouldConfirm ? AlertError : AlertWarning;
  const isZap = isZapQuote(quote);
  const priceImpact = isZap ? quote.priceImpact : 0;

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
  }, [isZap, priceImpact, setShouldWarn, setShouldConfirm, setConfirmed]);

  useEffect(() => {
    onChange(shouldConfirm && !confirmed);
  }, [shouldConfirm, confirmed, onChange]);

  if (!isZap || !shouldWarn) {
    return null;
  }

  return (
    <AlertComponent className={className}>
      <p>
        {t('Transact-Notice-PriceImpact', { priceImpact: formatPercent(-priceImpact, 2, '0.00%') })}
      </p>
      {shouldConfirm ? (
        <LabelledCheckbox
          onChange={setConfirmed}
          checked={confirmed}
          label={t('Transact-Notice-PriceImpact-Confirm')}
        />
      ) : null}
    </AlertComponent>
  );
});
