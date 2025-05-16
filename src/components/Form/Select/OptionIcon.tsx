import type { SelectItem, OptionIconProps } from './types.ts';
import { memo } from 'react';
import CheckBoxOutlineBlank from '../../../images/icons/CheckBoxBlank.svg?react';
import CheckBoxOutlined from '../../../images/icons/CheckBox.svg?react';
import { css } from '@repo/styles/css';

const iconCss = css({
  flex: '0 0 auto',
  color: 'text.dark',
});

export const OptionIcon = memo(function OptionIcon<T extends SelectItem>({
  selected,
}: OptionIconProps<T>) {
  const Icon = selected ? CheckBoxOutlined : CheckBoxOutlineBlank;
  return <Icon className={iconCss} />;
});
