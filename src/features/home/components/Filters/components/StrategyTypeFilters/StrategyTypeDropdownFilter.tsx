import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '../../../../../../components/Form/Select/Single/Select.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { StrategiesType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterStrategyType } from '../../../../../data/selectors/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';

export type StrategyTypeDropdownFilterProps = {
  layer?: 0 | 1 | 2;
};

export const StrategyTypeDropdownFilter = memo(function StrategyTypeDropdownFilter({
  layer = 0,
}: StrategyTypeDropdownFilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () => entries(TYPE_OPTIONS).map(([key, label]) => ({ value: key, label: t(label) })),
    [t]
  );
  const value = useAppSelector(selectFilterStrategyType);
  const handleChange = useCallback(
    (value: StrategiesType) => {
      dispatch(filteredVaultsActions.setStrategyType(value));
    },
    [dispatch]
  );

  return (
    <Select
      labelPrefix={t('Filter-Strategy')}
      selected={value}
      options={options}
      onChange={handleChange}
      fullWidth={true}
      layer={layer}
      variant="light"
    />
  );
});
