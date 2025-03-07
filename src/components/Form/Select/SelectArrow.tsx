import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { CommonSelectArrowProps } from './types.ts';
import ExpandLess from '../../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../../images/icons/mui/ExpandMore.svg?react';

const Arrow = memo(function Arrow({ active = false, ...svgProps }: CommonSelectArrowProps) {
  const Component = active ? ExpandLess : ExpandMore;
  return <Component {...svgProps} />;
});

export const SelectArrow = styled(Arrow, {
  base: {
    marginLeft: 'auto',
    flex: '0 0 auto',
  },
});
