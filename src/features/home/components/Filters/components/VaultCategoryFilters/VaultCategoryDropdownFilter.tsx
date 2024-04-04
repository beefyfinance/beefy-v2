import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults';
import { type ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import {
  DropdownItemLabel,
  type DropdownItemLabelProps,
  LabeledSelect,
} from '../../../../../../components/LabeledSelect';
import { CATEGORY_OPTIONS } from './category-options';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const CategoryDropdownLabel = memo<DropdownItemLabelProps>(function CategoryDropdownLabel(props) {
  const classes = useStyles();
  const { value, label: originalLabel } = props;
  const label = useMemo(() => {
    const option = CATEGORY_OPTIONS[value];
    if (option && option.highlight) {
      return (
        <div className={classes.holder}>
          {originalLabel} <span className={classes.highlight}>{option.highlight}</span>
        </div>
      );
    }
    return originalLabel;
  }, [value, originalLabel, classes]);

  return <DropdownItemLabel {...props} label={label} />;
});

export type VaultCategoryDropdownFilterProps = {
  className?: string;
};
export const VaultCategoryDropdownFilter = memo<VaultCategoryDropdownFilterProps>(
  function VaultCategoryDropdownFilter({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const options: Record<string, string> = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(CATEGORY_OPTIONS).map(([key, cat]) => [key, t(cat.i18nKey)])
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
      <LabeledSelect
        label={t('Filter-Category')}
        value={value}
        options={options}
        onChange={handleChange}
        selectClass={className}
        fullWidth={true}
        DropdownItemLabelComponent={CategoryDropdownLabel}
      />
    );
  }
);
