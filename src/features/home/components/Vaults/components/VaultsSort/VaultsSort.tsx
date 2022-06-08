import React, { FC, memo, ReactNode, useCallback, useMemo } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { Theme } from '@material-ui/core/styles';
import {
  filteredVaultsActions,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFilterSearchSortDirection,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults';
import { LabeledSelect, LabeledSelectProps } from '../../../../../../components/LabeledSelect';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type SortIconProps = {
  direction: 'none' | 'asc' | 'desc';
};
const SortIcon = memo<SortIconProps>(function SortIcon({ direction }) {
  const classes = useStyles();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 9" className={classes.sortIcon}>
      <path
        className={direction === 'asc' ? classes.sortIconHighlight : undefined}
        d="M2.463.199.097 2.827a.375.375 0 0 0 .279.626h5.066a.375.375 0 0 0 .278-.626L3.355.199a.6.6 0 0 0-.892 0Z"
      />
      <path
        className={direction === 'desc' ? classes.sortIconHighlight : undefined}
        d="M3.355 8.208 5.72 5.579a.375.375 0 0 0-.278-.626H.376a.375.375 0 0 0-.279.626l2.366 2.629a.601.601 0 0 0 .892 0Z"
      />
    </svg>
  );
});

type SortColumnHeaderProps = {
  label: string;
  sortKey: FilteredVaultsState['sort'];
  sorted: 'none' | 'asc' | 'desc';
  onChange: (field: string) => void;
  tooltip?: ReactNode;
};
const SortColumnHeader = memo<SortColumnHeaderProps>(function SortColumnHeader({
  label,
  sortKey,
  sorted,
  onChange,
  tooltip,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const handleChange = useCallback(() => {
    onChange(sortKey);
  }, [sortKey, onChange]);

  return (
    <button className={classes.sortColumn} onClick={handleChange}>
      {t(label)}
      {tooltip}
      <SortIcon direction={sorted} />
    </button>
  );
});

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
    field => {
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
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const value = useAppSelector(selectFilterSearchSortField);
  const options = useMemo<Record<FilteredVaultsState['sort'], string>>(() => {
    return {
      default: t('Filter-SortDefault'),
      walletValue: t('Filter-SortWallet'),
      depositValue: t('Filter-SortDeposited'),
      apy: t('Filter-SortApy'),
      daily: t('Filter-SortDaily'),
      tvl: t('Filter-SortTvl'),
      safetyScore: t('Filter-SortSafety'),
    };
  }, [t]);

  const handleChange = useCallback<LabeledSelectProps['onChange']>(
    value => {
      dispatch(filteredVaultsActions.setSort(value as FilteredVaultsState['sort']));
    },
    [dispatch]
  );

  return (
    <LabeledSelect
      label={t('Filter-Sort')}
      value={value}
      onChange={handleChange}
      options={options}
      borderless={true}
      fullWidth={true}
      defaultValue={'default'}
      selectClass={classes.sortDropdown}
    />
  );
});

export const VaultsSort = memo(function VaultsSort() {
  const sortColumns = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  return sortColumns ? (
    <SortColumns />
  ) : (
    <>
      <SortDropdown />
    </>
  );
});
