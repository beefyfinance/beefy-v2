import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMultiple } from '../../../../../../components/Form/Select/Multi/SelectMultiple.tsx';
import type {
  SelectItem,
  SelectMultiProps,
} from '../../../../../../components/Form/Select/types.ts';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { CATEGORY_OPTIONS } from './category-options.ts';

export type VaultCategoryDropdownFilterProps = {
  layer?: 0 | 1 | 2;
};

export const VaultCategoryDropdownFilter = memo(function VaultCategoryDropdownFilter({
  layer = 0,
}: VaultCategoryDropdownFilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () =>
      entries(CATEGORY_OPTIONS).map(([key, cat]) => ({
        value: key,
        label: t(cat.i18nKey),
      })),
    [t]
  );
  const value = useAppSelector(selectFilterVaultCategory);
  const handleChange = useCallback<SelectMultiProps<SelectItem<VaultCategoryType>>['onChange']>(
    selected => {
      dispatch(
        filteredVaultsActions.setVaultCategory(selected.length === options.length ? [] : selected)
      );
    },
    [dispatch, options]
  );

  return (
    <SelectMultiple
      labelPrefix={t('Filter-Category')}
      selected={value}
      options={options}
      onChange={handleChange}
      fullWidth={true}
      layer={layer}
      variant="light"
    />
  );
});
