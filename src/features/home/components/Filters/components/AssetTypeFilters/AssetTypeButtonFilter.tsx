import { memo, useCallback, useMemo } from 'react';
import type { ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { TYPE_OPTIONS } from './type-options';

export type AssetTypeButtonFilterProps = {
  className?: string;
};
export const AssetTypeButtonFilter = memo<AssetTypeButtonFilterProps>(
  function AssetTypeButtonFilter({ className }) {
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
    const value = useAppSelector(selectFilterAssetType);
    const handleChange = useCallback<ToggleButtonsProps['onChange']>(
      value => {
        dispatch(filteredVaultsActions.setAssetType(value as FilteredVaultsState['assetType']));
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
  }
);
