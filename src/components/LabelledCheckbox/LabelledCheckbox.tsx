import type { MouseEventHandler, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import CheckBoxOutlineBlank from '../../images/icons/CheckBoxBlank.svg?react';
import CheckBoxOutlined from '../../images/icons/CheckBox.svg?react';
import CircleCheckBoxOutlined from '../../images/icons/CircleCheckBoxBlank.svg?react';
import CircleCheckBox from '../../images/icons/CircleCheckBox.svg?react';

export type LabelledCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  iconCss?: CssStyles;
  labelCss?: CssStyles;
  checkedIconCss?: CssStyles;
  className?: CssStyles;
  checkVariant?: 'square' | 'circle';
};

export const LabelledCheckbox = memo(function LabelledCheckbox({
  checked,
  onChange,
  label,
  iconCss,
  labelCss,
  checkedIconCss,
  className,
  checkVariant = 'square',
}: LabelledCheckboxProps) {
  const handleChange = useCallback<MouseEventHandler<HTMLLabelElement>>(
    e => {
      e.stopPropagation();
      onChange(!checked);
    },
    [onChange, checked]
  );
  const Icon = useMemo(() => {
    if (checkVariant === 'circle') {
      return checked ? CircleCheckBox : CircleCheckBoxOutlined;
    }
    return checked ? CheckBoxOutlined : CheckBoxOutlineBlank;
  }, [checkVariant, checked]);

  return (
    <label
      onClick={handleChange}
      className={css(styles.checkbox, className)}
      data-checked={checked}
    >
      <Icon className={css(styles.icon, iconCss, checked && css.raw(checkedIconCss))} />
      <span className={css(styles.label, checked && styles.checkedLabel, labelCss)}>{label}</span>
    </label>
  );
});
