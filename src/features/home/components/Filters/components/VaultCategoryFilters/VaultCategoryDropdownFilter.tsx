import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults';
import { ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { LabeledSelect } from '../../../../../../components/LabeledSelect';
import { CATEGORY_OPTIONS } from './category-options';

export type VaultCategoryDropdownFilterProps = {
  className?: string;
};
export const VaultCategoryDropdownFilter = memo<VaultCategoryDropdownFilterProps>(function ({
  className,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(Object.entries(CATEGORY_OPTIONS).map(([key, label]) => [key, t(label)])),
    [t]
  );
  const value = useAppSelector(selectFilterVaultCategory);
  const handleChange = useCallback<ToggleButtonsProps['onChange']>(
    value => {
      dispatch(
        filteredVaultsActions.setVaultCategory(value as FilteredVaultsState['vaultCategory'])
      );
    },
    [dispatch]
  );

  return (
    <LabeledSelect
      label={t('Filter-Category')}
      value={value}
      options={options}
      onChange={handleChange}
      selectClass={className}
      fullWidth={false}
    />
  );
});
