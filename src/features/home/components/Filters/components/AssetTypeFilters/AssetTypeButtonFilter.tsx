import { memo, type ReactNode, useCallback, useMemo } from 'react';
import {
  MultiToggleButton,
  MultiToggleButtons,
} from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import type { MultiToggleButtonProps } from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { TYPE_OPTIONS } from './type-options.ts';
import { Highlight } from './Highlight.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import type { VaultAssetType } from '../../../../../data/reducers/filtered-vaults-types.ts';

export const AssetTypeButtonFilter = memo(function AssetTypeButtonFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () => entries(TYPE_OPTIONS).map(([key, cat]) => ({ value: key, label: t(cat.i18nKey) })),
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
    <MultiToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      fullWidth={false}
      ButtonComponent={CategoryToggleButton}
      variant="filter"
    />
  );
});

const CategoryToggleButton = memo<MultiToggleButtonProps<VaultAssetType>>(
  function CategoryToggleButton(props) {
    const { value, label: originalLabel } = props;
    const label = useMemo((): ReactNode => {
      const option = TYPE_OPTIONS[value];
      if (option && option.highlight) {
        return (
          <>
            {originalLabel} <Highlight>{option.highlight}</Highlight>
          </>
        );
      }
      return originalLabel;
    }, [value, originalLabel]);

    return <MultiToggleButton {...props} label={label} />;
  }
);
