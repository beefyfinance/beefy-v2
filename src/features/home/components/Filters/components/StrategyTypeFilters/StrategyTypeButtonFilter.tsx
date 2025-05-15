import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { StrategiesType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterStrategyType } from '../../../../../data/selectors/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';

export const StrategyTypeButtonFilter = memo(function StrategyTypeButtonFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const allKey = 'all';
  const options = useMemo(
    () =>
      entries(TYPE_OPTIONS)
        .filter(([key]) => key !== allKey)
        .map(([key, label]) => ({ value: key, label: t(label) })),
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
    <ToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      fullWidth={false}
      untoggleValue={allKey}
      variant="filter"
    />
  );
});
