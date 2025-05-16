import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { CATEGORY_OPTIONS } from './category-options.ts';
import { entries } from '../../../../../../helpers/object.ts';
import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { SelectMultipleContent } from '../../../../../../components/Form/Select/Multi/SelectMultipleContent.tsx';

export const VaultCategoryCheckList = memo(function VaultCategoryCheckList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [activeIndex] = useState<number | null>(null);

  const options = useMemo(
    () =>
      entries(CATEGORY_OPTIONS).map(([key, cat]) => ({
        value: key,
        label: t(cat.i18nKey),
      })),
    [t]
  );

  const value = useAppSelector(selectFilterVaultCategory);

  const handleChange = useCallback(
    (selected: VaultCategoryType[]) => {
      dispatch(
        filteredVaultsActions.setVaultCategory(selected.length === options.length ? [] : selected)
      );
    },
    [dispatch, options]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      onClick: () => {
        const option = options[index];
        if (option) {
          const newSelected =
            value.includes(option.value) ?
              value.filter(id => id !== option.value)
            : [...value, option.value];
          handleChange(newSelected);
        }
      },
    }),
    [options, value, handleChange]
  );

  const setListRefs = useMemo(
    () =>
      Array.from({ length: options.length }, () => () => {
        // We don't need to store refs for this implementation
      }),
    [options.length]
  );

  const allSelected = value.length === options.length;
  const noneSelected = value.length === 0;

  return (
    <SelectMultipleContent
      options={options}
      selected={value}
      activeIndex={activeIndex}
      allSelected={allSelected}
      noneSelected={noneSelected}
      getItemProps={getItemProps}
      setListRefs={setListRefs}
    />
  );
});
