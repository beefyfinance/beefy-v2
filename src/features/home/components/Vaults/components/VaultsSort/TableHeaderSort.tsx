import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader/SortColumnHeader.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { FilterValues, SortType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterEffectiveSort,
  selectFilterSortDirection,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { SubColumnSort } from './SubColumnSort.tsx';
import { hasSubSort } from '../../../../../../hooks/useSubSort.ts';

type SortColumn = {
  [K in SortType]: {
    label: string;
    value: K;
  };
}[SortType];

const SORT_COLUMNS = [
  { label: 'Filter-SortApy', value: 'apy' },
  { label: 'Filter-SortDaily', value: 'daily' },
  { label: 'Filter-SortTvl', value: 'tvl' },
  { label: 'Filter-SortDeposited', value: 'depositValue' },
] satisfies SortColumn[];

export const TableHeaderSort = memo(function TableHeaderSort() {
  const dispatch = useAppDispatch();
  // 'relevance' selects no column, so the first click during a search always starts a fresh sort
  const sortField = useAppSelector(selectFilterEffectiveSort);
  const sortDirection = useAppSelector(selectFilterSortDirection);

  const handleSort = useCallback(
    (field: FilterValues['sort']) => {
      if (field === sortField) {
        dispatch(
          filteredVaultsActions.update({ sortDirection: sortDirection === 'asc' ? 'desc' : 'asc' })
        );
      } else {
        dispatch(filteredVaultsActions.update({ sort: field, sortDirection: 'desc' }));
      }
    },
    [dispatch, sortField, sortDirection]
  );

  return (
    <HeaderRow>
      {SORT_COLUMNS.map(({ label, value }) => (
        <SortColumnHeader
          key={value}
          label={label}
          sortKey={value}
          sorted={sortField === value ? sortDirection : 'none'}
          onChange={handleSort}
          before={hasSubSort(value) && <SubColumnSort columnKey={value} />}
        />
      ))}
    </HeaderRow>
  );
});

const HeaderRow = styled('div', {
  base: {
    display: 'grid',
    width: '100%',
    columnGap: '24px',
    gridTemplateColumns: 'var(--vaults-list-grid-columns)',
  },
});
