import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterStrategyType } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';
import { entries } from '../../../../../../helpers/object.ts';
import type { StrategiesType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { SelectSingleContent } from '../../../../../../components/Form/Select/Single/SelectSingleContent.tsx';
import type { SelectItem } from '../../../../../../components/Form/Select/types.ts';

type StrategyTypeOption = SelectItem & {
  value: StrategiesType;
};

export const StategyTypeCheckBoxList = memo(function StategyTypeCheckBoxList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo<StrategyTypeOption[]>(
    () => entries(TYPE_OPTIONS).map(([key, label]) => ({ value: key, label: t(label) })),
    [t]
  );
  const value = useAppSelector(selectFilterStrategyType);
  const selectedIndex = useMemo(
    () => options.findIndex(opt => opt.value === value),
    [options, value]
  );

  const handleChange = useCallback(
    (value: StrategiesType) => {
      dispatch(filteredVaultsActions.setStrategyType(value));
    },
    [dispatch]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      onClick: () => {
        const option = options[index];
        // If clicking the currently selected option, deselect it by setting to 'all'
        if (option.value === value) {
          handleChange('all');
        } else {
          handleChange(option.value);
        }
      },
    }),
    [handleChange, options, value]
  );
  const disabledIndexes = useMemo(() => {
    const allIndex = options.findIndex(opt => opt.value === 'all');
    return allIndex >= 0 ? [allIndex] : undefined;
  }, [options]);

  const noneSelected = useMemo(() => {
    return selectedIndex === null;
  }, [selectedIndex]);

  return (
    <SelectSingleContent
      options={options}
      selectedIndex={selectedIndex}
      activeIndex={selectedIndex}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={[]}
      disabledIndexes={disabledIndexes}
    />
  );
});
