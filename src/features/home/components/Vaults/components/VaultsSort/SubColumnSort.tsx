import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { type SortWithSubSort } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useSubSort } from '../../../../../../hooks/useSubSort.ts';

export type SubColumnSortProps<T extends SortWithSubSort> = {
  columnKey: T;
};

export const SubColumnSort = memo(function SubColumnSort<T extends SortWithSubSort>({
  columnKey,
}: SubColumnSortProps<T>) {
  const { next, label, parentSelected } = useSubSort(columnKey);
  return (
    <SortButton data-active={parentSelected || undefined} onClick={next}>
      {label}
    </SortButton>
  );
});

const SortButton = styled('button', {
  base: {
    background: 'none',
    border: 'none',
    padding: '0',
    textStyle: 'subline.sm',
    color: 'text.dark',
    display: 'flex',
    textDecoration: 'underline',
    textDecorationColor: 'text.underline',
    textUnderlineOffset: '3px',
    _hover: {
      color: 'text.light',
    },
    _active: {
      color: 'text.light',
    },
  },
});
