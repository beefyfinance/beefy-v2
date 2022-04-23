import { memo, useCallback, useMemo } from 'react';
import { ToggleButtons, ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultType } from '../../../../../data/selectors/filtered-vaults';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { TYPE_OPTIONS } from './type-options';

export type VaultTypeButtonFilterProps = {
  className?: string;
};
export const VaultTypeButtonFilter = memo<VaultTypeButtonFilterProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const allKey = 'all';
  const options: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(TYPE_OPTIONS)
          .filter(([key]) => key !== allKey)
          .map(([key, label]) => [key, t(label)])
      ),
    [t]
  );
  const value = useAppSelector(selectFilterVaultType);
  const handleChange = useCallback<ToggleButtonsProps['onChange']>(
    value => {
      dispatch(filteredVaultsActions.setVaultType(value as FilteredVaultsState['vaultType']));
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
