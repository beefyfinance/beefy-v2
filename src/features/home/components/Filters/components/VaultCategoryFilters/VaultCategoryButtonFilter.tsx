import { memo, useCallback, useMemo } from 'react';
import { ToggleButtons, ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { CATEGORY_OPTIONS } from './category-options';

export type VaultCategoryButtonFilterProps = {
  className?: string;
};
export const VaultCategoryButtonFilter = memo<VaultCategoryButtonFilterProps>(function ({
  className,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const allKey = 'all';
  const options: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CATEGORY_OPTIONS)
          .filter(([key]) => key !== allKey)
          .map(([key, label]) => [key, t(label)])
      ),
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
    <ToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      buttonsClass={className}
      fullWidth={false}
      untoggleValue={allKey}
    />
  );
});
