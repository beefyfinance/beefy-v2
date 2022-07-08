import { makeStyles } from '@material-ui/core';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../components/Alerts';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';
import { LabelledCheckbox } from '../../../../components/LabelledCheckbox';
import { formatPercent } from '../../../../helpers/format';

const useStyles = makeStyles(styles);
const IMPACT_WARN_PERCENT = 1 / 100;
const IMPACT_CONFIRM_PERCENT = 5 / 100;

export type ZapPriceImpactProps = {
  mode: 'deposit' | 'withdraw';
  onChange: (shouldDisable: boolean) => void;
};
export const ZapPriceImpact = memo<ZapPriceImpactProps>(function ZapPriceImpact({
  mode,
  onChange,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [shouldWarn, setShouldWarn] = useState(false);
  const [shouldConfirm, setShouldConfirm] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const isZap = useAppSelector(state => state.ui[mode].isZap);
  const isZapError = useAppSelector(state => state.ui[mode].zapError) ? isZap : false;
  const isZapSuccess = useAppSelector(state => state.ui[mode].zapEstimate)
    ? isZap && !isZapError
    : false;
  const priceImpact = useAppSelector(state => state.ui[mode].zapEstimate?.priceImpact || 0);
  const AlertComponent = shouldConfirm ? AlertError : AlertWarning;

  useEffect(() => {
    if (isZapSuccess && priceImpact >= IMPACT_WARN_PERCENT) {
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
  }, [isZapSuccess, priceImpact, setShouldWarn, setShouldConfirm, setConfirmed]);

  useEffect(() => {
    onChange(isZapError || (shouldConfirm && !confirmed));
  }, [shouldConfirm, confirmed, isZapError, onChange]);

  if (!isZapSuccess || !shouldWarn) {
    return null;
  }

  return (
    <AlertComponent className={classes.alert}>
      <p>{t('Zap-PriceImpact-Notice', { priceImpact: formatPercent(-priceImpact, 2, '0.00%') })}</p>
      {shouldConfirm ? (
        <LabelledCheckbox
          onChange={setConfirmed}
          checked={confirmed}
          label={t('Zap-PriceImpact-Confirm')}
        />
      ) : null}
    </AlertComponent>
  );
});
