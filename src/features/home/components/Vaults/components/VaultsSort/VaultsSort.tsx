import React, { FC, memo, useCallback, useMemo } from 'react';
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
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader';

const useStyles = makeStyles(styles);

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
