import { memo, useCallback, useMemo } from 'react';
import { ToggleButtons, ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterUserCategory } from '../../../../../data/selectors/filtered-vaults';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { CATEGORY_OPTIONS } from './category-options';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type UserCategoryButtonFilterProps = {
  className?: string;
};
export const UserCategoryButtonFilter = memo<UserCategoryButtonFilterProps>(function ({
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const options: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(Object.entries(CATEGORY_OPTIONS).map(([key, label]) => [key, t(label)])),
    [t]
  );
  const value = useAppSelector(selectFilterUserCategory);
  const handleChange = useCallback<ToggleButtonsProps['onChange']>(
    value => {
      dispatch(filteredVaultsActions.setUserCategory(value as FilteredVaultsState['userCategory']));
    },
    [dispatch]
  );

  return (
    <ToggleButtons
      value={value}
      options={options}
      onChange={handleChange}
      buttonsClass={className}
      buttonClass={classes.button}
      selectedClass={classes.selected}
    />
  );
});
