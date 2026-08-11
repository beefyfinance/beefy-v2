import { css } from '@repo/styles/css';
import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NewBadge } from '../../../../../../components/Header/components/Badges/NewBadge.tsx';
import type { MultiToggleButtonProps } from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import {
  MultiToggleButton,
  MultiToggleButtons,
} from '../../../../../../components/ToggleButtons/MultiToggleButtons.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { CATEGORY_OPTIONS, type VaultCategory } from './category-options.ts';

export const VaultCategoryButtonFilter = memo(function VaultCategoryButtonFilter() {
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

  const handleChange = useCallback(
    (selected: VaultCategoryType[]) => {
      dispatch(
        filteredVaultsActions.update({
          vaultCategory: selected.length === options.length ? [] : selected,
        })
      );
    },
    [dispatch, options]
  );

  return (
    <MultiToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      variant="filter"
      ButtonComponent={CategoryToggleButton}
    />
  );
});

const badgeStyle = css.raw({
  left: '85%',
  right: 'auto',
  transform: 'translate(-50%, -50%)',
  zIndex: 'badge',
});

const CategoryToggleButton = memo<MultiToggleButtonProps<VaultCategoryType>>(
  function CategoryToggleButton(props) {
    const { value, label: originalLabel } = props;
    const label = useMemo((): ReactNode => {
      const option: VaultCategory = CATEGORY_OPTIONS[value];
      if (option.highlight === 'new') {
        return (
          <>
            {originalLabel}
            <NewBadge css={badgeStyle} />
          </>
        );
      }
      return originalLabel;
    }, [value, originalLabel]);

    return <MultiToggleButton {...props} label={label} />;
  }
);
