import * as React from 'react';
import { memo, MouseEventHandler, ReactNode, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type LabelledCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  checkboxClass?: string;
  iconClass?: string;
  labelClass?: string;
  checkedClass?: string;
};

export const LabelledCheckbox = memo<LabelledCheckboxProps>(function ButtonLink({
  checked,
  onChange,
  label,
  checkboxClass,
  iconClass,
  labelClass,
  checkedClass,
}) {
  const baseClasses = useStyles();
  const handleChange = useCallback<MouseEventHandler<HTMLLabelElement>>(
    e => {
      e.stopPropagation();
      onChange(!checked);
    },
    [onChange, checked]
  );
  const Icon = checked ? CheckBoxOutlined : CheckBoxOutlineBlank;

  return (
    <label
      onClick={handleChange}
      className={clsx(baseClasses.checkbox, checkboxClass, {
        [clsx(baseClasses.checked, checkedClass)]: checked,
      })}
    >
      <Icon className={clsx(baseClasses.icon, iconClass)} />
      <span className={clsx(baseClasses.label, labelClass)}>{label}</span>
    </label>
  );
});
