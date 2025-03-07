import { memo } from 'react';
import { ToggleButtons } from '../../../../components/ToggleButtons/ToggleButtons.tsx';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';
import { Select } from '../../../../components/Form/Select/Single/Select.tsx';
import type { SelectItem } from '../../../../components/Form/Select/types.ts';

export type StatSwitcherProps<T extends string = string> = {
  options: Array<SelectItem<T>>;
  stat: T;
  onChange: (newStat: T) => void;
};

export const StatSwitcher = memo(function StatSwitcher<T extends string = string>({
  options,
  onChange,
  stat,
}: StatSwitcherProps<T>) {
  const mobileView = useBreakpoint({ to: 'xs' });

  return mobileView ? (
    <Select
      fullWidth={true}
      options={options}
      selected={stat}
      onChange={onChange}
      variant="middle"
    />
  ) : (
    <ToggleButtons value={stat} options={options} onChange={onChange} variant="filter" />
  );
});
