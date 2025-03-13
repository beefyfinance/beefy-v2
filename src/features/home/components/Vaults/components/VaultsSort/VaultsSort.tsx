import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectFilterSearchSortDirection,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { styles } from './styles.ts';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader/SortColumnHeader.tsx';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { Select } from '../../../../../../components/Form/Select/Single/Select.tsx';
import type {
  SelectItem,
  SelectSingleProps,
} from '../../../../../../components/Form/Select/types.ts';

const useStyles = legacyMakeStyles(styles);

const SORT_COLUMNS: {
  label: string;
  sortKey: FilteredVaultsState['sort'];
  TooltipComponent?: FC;
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

const SortDropdown = memo(function SortDropdown() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(selectFilterSearchSortField);
  const options = useMemo<Array<SelectItem<FilteredVaultsState['sort']>>>(
    () => [
      { value: 'default', label: t('Filter-SortDefault') },
      { value: 'walletValue', label: t('Filter-SortWallet') },
      { value: 'depositValue', label: t('Filter-SortDeposited') },
      { value: 'apy', label: t('Filter-SortApy') },
      { value: 'daily', label: t('Filter-SortDaily') },
      { value: 'tvl', label: t('Filter-SortTvl') },
      { value: 'safetyScore', label: t('Filter-SortSafety') },
    ],
    [t]
  );

  const handleChange = useCallback<
    SelectSingleProps<SelectItem<FilteredVaultsState['sort']>>['onChange']
  >(
    value => {
      dispatch(filteredVaultsActions.setSort(value || 'default'));
    },
    [dispatch]
  );

  return (
    <Select
      labelPrefix={t('Filter-Sort')}
      selected={value}
      onChange={handleChange}
      options={options}
      borderless={true}
      fullWidth={true}
      variant="dark"
    />
  );
});

export const VaultsSort = memo(function VaultsSort() {
  const sortColumns = useBreakpoint({ from: 'lg' });

  return sortColumns ? (
    <SortColumns />
  ) : (
    <>
      <SortDropdown />
    </>
  );
});
