import type { MouseEventHandler, ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import CheckBoxOutlineBlank from '../../images/icons/CheckBoxBlank.svg?react';
import CheckBoxOutlined from '../../images/icons/CheckBox.svg?react';
import CircleCheckBoxOutlined from '../../images/icons/CircleCheckBoxBlank.svg?react';
import CircleCheckBox from '../../images/icons/CircleCheckBox.svg?react';
import { styled } from '@repo/styles/jsx';

export type LabelledCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  containerCss?: CssStyles;
  iconCss?: CssStyles;
  labelCss?: CssStyles;
  checkedIconCss?: CssStyles;
  checkVariant?: 'square' | 'circle';
  endAdornment?: ReactNode;
};

export const LabelledCheckbox = memo(function LabelledCheckbox({
  checked,
  onChange,
  label,
  iconCss,
  labelCss,
  checkedIconCss,
  checkVariant = 'square',
  endAdornment,
  containerCss,
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
    <Label className={css(containerCss)} onClick={handleChange} data-checked={checked}>
      <Icon className={css(styles.icon, iconCss, checked && checkedIconCss)} />
      <Text checked={checked} className={css(labelCss)}>
        {label}
      </Text>
      {endAdornment && <EndAdornment>{endAdornment}</EndAdornment>}
    </Label>
  );
});

const Label = styled('label', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    color: 'text.dark',
    cursor: 'pointer',
    columnGap: '10px',
    userSelect: 'none',
    paddingBlock: '8px',
    width: '100%',
  },
});

const EndAdornment = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
  },
});

const Text = styled('span', {
  base: {
    display: 'flex',
    alignItems: 'center',
  },
  variants: {
    checked: {
      true: {
        color: 'text.light',
      },
    },
  },
});

const styles = {
  icon: css.raw({
    color: 'text.dark',
  }),
};
