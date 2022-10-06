import BigNumber from 'bignumber.js';
import { memo, useCallback } from 'react';
import { AmountInput, AmountInputProps, useStyles } from './AmountInput';
import { Button } from '../../../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

export type AmountInputMaxProps = Omit<AmountInputProps, 'endAdornment' | 'onChange'> & {
  max: BigNumber;
  onChange: (value: BigNumber, isMax: boolean) => void;
};

export const AmountInputMax = memo<AmountInputMaxProps>(function AmountInputMax({
  value,
  onChange,
  maxDecimals = 2,
  error = false,
  className,
  max,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const handleChange = useCallback<AmountInputProps['onChange']>(
    newValue => {
      if (newValue.gte(max)) {
        onChange(max, true);
      } else {
        onChange(newValue, false);
      }
    },
    [onChange, max]
  );
  const handleMax = useCallback(() => onChange(max, true), [onChange, max]);

  return (
    <AmountInput
      value={value}
      onChange={handleChange}
      maxDecimals={maxDecimals}
      className={className}
      error={error}
      endAdornment={
        <button onClick={handleMax} disabled={max.lte(BIG_ZERO)} className={classes.max}>
          {t('Transact-Max')}
        </button>
      }
    />
  );
});
