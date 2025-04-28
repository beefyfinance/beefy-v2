import { memo } from 'react';
import SortArrow from '../../images/icons/sortArrow.svg?react';
import { css, cx } from '@repo/styles/css';

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};

export const SortIcon = memo(function SortIcon({ direction }: SortIconProps) {
  return (
    <SortArrow
      className={cx(direction === 'asc' && ascendingClass, direction !== 'none' && selectedClass)}
    />
  );
});

const ascendingClass = css({
  transform: 'rotate(180deg)',
});

const selectedClass = css({
  color: 'text.light',
});
