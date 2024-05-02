import { memo, useCallback, useMemo } from 'react';
import {
  ToggleButton,
  type ToggleButtonProps,
  type ToggleButtonsProps,
} from '../../../../../../components/ToggleButtons';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterVaultCategory } from '../../../../../data/selectors/filtered-vaults';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { CATEGORY_OPTIONS } from './category-options';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const CategoryToggleButton = memo<ToggleButtonProps>(function CategoryToggleButton(props) {
  const classes = useStyles();
  const { value, label: originalLabel } = props;
  const label = useMemo(() => {
    const option = CATEGORY_OPTIONS[value];
    if (option && option.highlight) {
      return (
        <>
          {originalLabel} <span className={classes.highlight}>{option.highlight}</span>
        </>
      );
    }
    return originalLabel;
  }, [value, originalLabel, classes]);

  return <ToggleButton {...props} label={label} />;
});

export type VaultCategoryButtonFilterProps = {
  className?: string;
};
export const VaultCategoryButtonFilter = memo<VaultCategoryButtonFilterProps>(
  function VaultCategoryButtonFilter({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const allKey = 'all';
    const options: Record<string, string> = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(CATEGORY_OPTIONS)
            .filter(([key]) => key !== allKey)
            .map(([key, cat]) => [key, t(cat.i18nKey)])
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
        ButtonComponent={CategoryToggleButton}
      />
    );
  }
);
