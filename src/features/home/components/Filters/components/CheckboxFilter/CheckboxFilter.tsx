import type { FilteredVaultBooleanKeys } from '../../../../../data/reducers/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterBoolean } from '../../../../../data/selectors/filtered-vaults.ts';
import type { LabelledCheckboxProps } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type CheckboxFilterProps = {
  filter: FilteredVaultBooleanKeys;
  label: string;
  icon?: ReactNode;
  css?: CssStyles;
};
export const CheckboxFilter = memo(function CheckboxFilter({
  filter,
  label,
  icon,
  css: cssProp,
}: CheckboxFilterProps) {
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
      checkboxCss={css.raw(cssProp, styles.checkbox)}
    />
  );
});
