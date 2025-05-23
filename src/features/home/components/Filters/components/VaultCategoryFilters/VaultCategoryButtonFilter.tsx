import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MultiToggleButtons } from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { CATEGORY_OPTIONS } from './category-options.ts';

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
    <MultiToggleButtons value={value} options={options} onChange={handleChange} variant="filter" />
  );
});
