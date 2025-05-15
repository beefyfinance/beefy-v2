import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';
import { entries } from '../../../../../../helpers/object.ts';
import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { SelectMultipleContent } from '../../../../../../components/Form/Select/Multi/SelectMultipleContent.tsx';

export const AssetTypeCheckList = memo(function AssetTypeCheckList() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () =>
      entries(TYPE_OPTIONS).map(([key, cat]) => ({
        value: key,
        label: t(cat.i18nKey),
        badge: cat.highlight,
      })),
    [t]
  );
  const value = useAppSelector(selectFilterAssetType);
  const [activeIndex] = useState<number | null>(null);

  const handleChange = useCallback(
    (selected: VaultAssetType[]) => {
      dispatch(
        filteredVaultsActions.setAssetType(selected.length === options.length ? [] : selected)
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
