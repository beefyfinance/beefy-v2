import {
  FilteredVaultBooleanKeys,
  filteredVaultsActions,
} from '../../../../../data/reducers/filtered-vaults';
import { memo, ReactNode, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterBoolean } from '../../../../../data/selectors/filtered-vaults';
import {
  LabelledCheckbox,
  LabelledCheckboxProps,
} from '../../../../../../components/LabelledCheckbox';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type CheckboxFilterProps = {
  filter: FilteredVaultBooleanKeys;
  label: string;
  icon?: ReactNode;
  className?: string;
};
export const CheckboxFilter = memo<CheckboxFilterProps>(function CheckboxFilter({
  filter,
  label,
  icon,
  className,
}) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const value = useAppSelector(state => selectFilterBoolean(state, filter));
  const handleChange = useCallback<LabelledCheckboxProps['onChange']>(
    checked => {
      dispatch(filteredVaultsActions.setBoolean({ filter, value: checked }));
    },
    [dispatch, filter]
  );

  return (
    <LabelledCheckbox
      label={
        <>
          {icon ? <div className={classes.labelIcon}>{icon}</div> : null}
          {label}
        </>
      }
      onChange={handleChange}
      checked={value}
      checkboxClass={clsx(className, classes.checkbox)}
    />
  );
});
