import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults';
import type { ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { LabeledSelect } from '../../../../../../components/LabeledSelect';
import { TYPE_OPTIONS } from './type-options';

export type AssetTypeDropdownFilterProps = {
  className?: string;
};
export const AssetTypeDropdownFilter = memo<AssetTypeDropdownFilterProps>(
  function AssetTypeDropdownFilter({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const options: Record<string, string> = useMemo(
      () => Object.fromEntries(Object.entries(TYPE_OPTIONS).map(([key, label]) => [key, t(label)])),
      [t]
    );
    const value = useAppSelector(selectFilterAssetType);
    const handleChange = useCallback<ToggleButtonsProps['onChange']>(
      value => {
        dispatch(filteredVaultsActions.setAssetType(value as FilteredVaultsState['assetType']));
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
        fullWidth={true}
      />
    );
  }
);
