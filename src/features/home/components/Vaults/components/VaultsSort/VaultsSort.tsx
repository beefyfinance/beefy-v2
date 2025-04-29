import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';

import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectFilterSearchSortDirection,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { styles } from './styles.ts';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader/SortColumnHeader.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';

const useStyles = legacyMakeStyles(styles);

export const SORT_COLUMNS: {
  label: string;
  sortKey: FilteredVaultsState['sort'];
}[] = [
  { label: 'Filter-SortWallet', sortKey: 'walletValue' },
  { label: 'Filter-SortDeposited', sortKey: 'depositValue' },
  { label: 'Filter-SortApy', sortKey: 'apy' },
  { label: 'Filter-SortDaily', sortKey: 'daily' },
  { label: 'Filter-SortTvl', sortKey: 'tvl' },
  { label: 'Filter-SortSafety', sortKey: 'safetyScore' },
];

const SortColumns = memo(function SortColumns() {
  const classes = useStyles();
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
    <div className={classes.sortColumns}>
      {SORT_COLUMNS.map(({ label, sortKey }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sortField === sortKey ? sortDirection : 'none'}
          onChange={handleSort}
        />
      ))}
    </div>
  );
});

export const VaultsSort = memo(function VaultsSort() {
  const sortColumns = useBreakpoint({ from: 'lg' });

  return sortColumns ? <SortColumns /> : null;
});
