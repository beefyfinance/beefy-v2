import { makeStyles } from '@material-ui/core';
import type { ChangeEvent } from 'react';
import React, { memo } from 'react';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader';
import { styles } from './styles';
import type { SortedOptions } from '../../hook';
import { Search } from '../../../../../../components/Search';

const useStyles = makeStyles(styles);

interface FilterProps {
  sortOptions: SortedOptions;
  handleSort: (field: string) => void;
  handleSearchText: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  handleClearText: () => void;
  searchText: string;
}

export const Filter = memo<FilterProps>(function Filter({
  sortOptions,
  handleSort,
  handleSearchText,
  searchText,
  handleClearText,
}) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Search
        handleSearchText={handleSearchText}
        searchText={searchText}
        handleClearText={handleClearText}
      />
      <SortColumns sortOptions={sortOptions} handleSort={handleSort} />
    </div>
  );
});

const SORT_COLUMNS: {
  label: string;
  sortKey: string;
  className?: string;
}[] = [
  { label: 'Dashboard-Filter-AtDeposit', sortKey: 'atDeposit', className: 'hideSm' },
  { label: 'Dashboard-Filter-Now', sortKey: 'now', className: 'hideSm' },
  { label: 'Dashboard-Filter-Yield', sortKey: 'yield', className: 'hideSm' },
  { label: 'Dashboard-Filter-Pnl', sortKey: 'pnl' },
  { label: 'Dashboard-Filter-Apy', sortKey: 'apy', className: 'hideMd' },
  { label: 'Dashboard-Filter-DailyYield', sortKey: 'dailyYield', className: 'hideMd' },
];

interface SortColumnsProps {
  sortOptions: SortedOptions;
  handleSort: (field: string) => void;
}

const SortColumns = memo<SortColumnsProps>(function SortColumns({ sortOptions, handleSort }) {
  const classes = useStyles();

  const { sort, sortDirection } = sortOptions;
  return (
    <div className={classes.sortColumns}>
      {SORT_COLUMNS.map(({ label, sortKey, className }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sort === sortKey ? sortDirection : 'none'}
          onChange={handleSort}
          className={className ? classes[className] : ''}
        />
      ))}
    </div>
  );
});
