import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';
import { SelectMultiple } from '../../../../../../components/Form/Select/Multi/SelectMultiple.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export type AssetTypeDropdownFilterProps = {
  layer?: 0 | 1 | 2;
};

export const AssetTypeDropdownFilter = memo(function AssetTypeDropdownFilter({
  layer = 0,
}: AssetTypeDropdownFilterProps) {
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

  const handleChange = useCallback(
    (selected: VaultAssetType[]) => {
      dispatch(
        filteredVaultsActions.setAssetType(selected.length === options.length ? [] : selected)
      );
    },
    [dispatch, options]
  );

  return (
    <SelectMultiple
      labelPrefix={t('Filter-Type')}
      selected={value}
      options={options}
      onChange={handleChange}
      fullWidth={true}
      layer={layer}
    />
  );
});
