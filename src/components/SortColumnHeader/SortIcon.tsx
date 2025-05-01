import { css, cx } from '@repo/styles/css';
import { memo } from 'react';
import SortArrow from '../../images/icons/sortArrow.svg?react';

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};

export const SortIcon = memo(function SortIcon({ direction }: SortIconProps) {
  return (
    <SortArrow
      className={cx(
        iconClass,
        direction === 'asc' && ascendingClass,
        direction !== 'none' && selectedClass
      )}
    />
  );
});

const iconClass = css({
  flexShrink: '0',
});

const ascendingClass = css({
  transform: 'rotate(180deg)',
});

const selectedClass = css({
  color: 'text.light',
});
