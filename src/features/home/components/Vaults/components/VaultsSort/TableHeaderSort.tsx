import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader/SortColumnHeader.tsx';
import { AVG_APY_PERIODS } from '../../../../../../helpers/apy.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type {
  FilteredVaultsState,
  SortType,
  SortWithSubSort,
} from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterSearchSortDirection,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { type FilterSubColumn, SubColumnSort } from './SubColumnSort.tsx';

type SubKeyField<T extends SortType> =
  T extends SortWithSubSort ? { subKeys: FilterSubColumn<T>[] } : unknown;

type SortColumn = {
  [K in SortType]: {
    label: string;
    value: K;
  } & SubKeyField<K>;
}[SortType];

const SORT_COLUMNS = [
  { label: 'Filter-SortWallet', value: 'walletValue' },
  { label: 'Filter-SortDeposited', value: 'depositValue' },
  {
    label: 'Filter-SortApy',
    value: 'apy',
    subKeys: [
      { label: 'Filter-SortApy-default', value: 'default' },
      ...AVG_APY_PERIODS.map(period => ({
        label: `Filter-SortApy-avg${period}d`,
        value: period,
      })),
    ],
  },
  { label: 'Filter-SortDaily', value: 'daily' },
  { label: 'Filter-SortTvl', value: 'tvl' },
  { label: 'Filter-SortSafety', value: 'safetyScore' },
] satisfies SortColumn[];

export const TableHeaderSort = memo(function TableHeaderSort() {
  const dispatch = useAppDispatch();
  const sortField = useAppSelector(selectFilterSearchSortField);
  const sortDirection = useAppSelector(selectFilterSearchSortDirection);

  const handleSort = useCallback(
    (field: FilteredVaultsState['sort']) => {
      if (field === sortField) {
        dispatch(filteredVaultsActions.setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'));
      } else {
        dispatch(filteredVaultsActions.setSortFieldAndDirection({ field, direction: 'desc' }));
      }
    },
    [dispatch, sortField, sortDirection]
  );

  return (
    <HeaderRow>
      {SORT_COLUMNS.map(({ label, value, subKeys }) => (
        <SortColumnHeader
          key={value}
          label={label}
          sortKey={value}
          sorted={sortField === value ? sortDirection : 'none'}
          onChange={handleSort}
          before={
            subKeys && (
              <SubColumnSort
                columnSelected={sortField === value}
                columnKey={value}
                subColumns={subKeys}
              />
            )
          }
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
