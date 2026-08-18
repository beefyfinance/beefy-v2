import { css, cx } from '@repo/styles/css';
import { memo } from 'react';
import ExpandLess from '../../../../../../images/icons/mui/ExpandLess.svg?react';

export const Chevron = memo(function Chevron({ open }: { open: boolean }) {
  return <ExpandLess className={cx(iconCss, open ? undefined : closedCss)} />;
});

const iconCss = css({
  color: 'text.dark',
  transition: 'transform 0.15s ease-in-out',
});

const closedCss = css({
  transform: 'rotate(180deg)',
});
