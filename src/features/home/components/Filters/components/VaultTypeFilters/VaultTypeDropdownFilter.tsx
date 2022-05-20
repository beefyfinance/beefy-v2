import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultType } from '../../../../../data/selectors/filtered-vaults';
import { ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { LabeledSelect } from '../../../../../../components/LabeledSelect';
import { TYPE_OPTIONS } from './type-options';

export type VaultTypeDropdownFilterProps = {
  className?: string;
};
export const VaultTypeDropdownFilter = memo<VaultTypeDropdownFilterProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options: Record<string, string> = useMemo(
    () => Object.fromEntries(Object.entries(TYPE_OPTIONS).map(([key, label]) => [key, t(label)])),
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
    <LabeledSelect
      label={t('Filter-Type')}
      value={value}
      options={options}
      onChange={handleChange}
      selectClass={className}
      fullWidth={false}
    />
  );
});
