import { memo, useMemo } from 'react';
import ContentLoader from 'react-content-loader';
import type { BaseInputProps } from '../../../../../../components/Form/Input/BaseInput.tsx';
import { BaseInput } from '../../../../../../components/Form/Input/BaseInput.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectQuoteStatus } from '../../../../../data/selectors/on-ramp.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function numberToString(value: number, maxDecimals: number): string {
  if (value <= 0) {
    return '';
  }

  return value.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}

const PendingAmount = memo(function PendingAmount() {
  const classes = useStyles();
  return (
    <div className={classes.pending}>
      <ContentLoader
        viewBox="0 0 88 32"
        width="88"
        height="32"
        backgroundColor="rgba(255, 255, 255, 0.12)"
        foregroundColor="rgba(255, 255, 255, 0.32)"
      >
        <rect x="0" y="4" rx="8" ry="8" width="88" height="24" />
      </ContentLoader>
    </div>
  );
});

export type AmountOutputProps = {
  maxDecimals?: number;
  value: number;
  endAdornment?: BaseInputProps['endAdornment'];
};
export const AmountOutput = memo(function AmountOutput({
  value,
  maxDecimals = 2,
  endAdornment,
}: AmountOutputProps) {
  const displayValue = useMemo(() => numberToString(value, maxDecimals), [value, maxDecimals]);
  const pending = useAppSelector(selectQuoteStatus) === 'pending';
  const startAdornment = useMemo(() => (pending ? <PendingAmount /> : undefined), [pending]);

  return (
    <BaseInput
      value={pending ? '' : displayValue}
      fullWidth={true}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      placeholder={pending ? '' : '0'}
      readOnly={true}
      variant="amount"
    />
  );
});
