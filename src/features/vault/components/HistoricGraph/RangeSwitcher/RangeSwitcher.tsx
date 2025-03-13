import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../components/ToggleButtons/ToggleButtons.tsx';
import type { TimeRange } from '../utils.ts';

export type RangeSwitcherProps = {
  availableRanges: TimeRange[];
  range: TimeRange;
  onChange: (newBucket: TimeRange) => void;
};

export const RangeSwitcher = memo(function RangeSwitcher({
  availableRanges,
  range,
  onChange,
}: RangeSwitcherProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => availableRanges.map(range => ({ value: range, label: t(`Graph-${range}`) })),
    [availableRanges, t]
  );

  useEffect(() => {
    if (availableRanges.length > 0 && !availableRanges.includes(range)) {
      onChange(availableRanges[availableRanges.length - 1]);
    }
  }, [range, availableRanges, onChange]);

  return (
    <ToggleButtons
      value={range}
      options={options}
      onChange={onChange}
      noBackground={true}
      noPadding={true}
      noBorder={true}
      variant="range"
    />
  );
});
