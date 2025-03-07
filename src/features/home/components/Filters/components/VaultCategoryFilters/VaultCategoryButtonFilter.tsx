import { memo, useCallback, useMemo } from 'react';
import { MultiToggleButtons } from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { CATEGORY_OPTIONS } from './category-options.ts';
import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { entries } from '../../../../../../helpers/object.ts';

export const VaultCategoryButtonFilter = memo(function VaultCategoryButtonFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () => entries(CATEGORY_OPTIONS).map(([key, cat]) => ({ value: key, label: t(cat.i18nKey) })),
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

  return (
    <MultiToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      fullWidth={false}
      variant="filter"
    />
  );
});
