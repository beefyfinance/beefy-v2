import { InputBase, makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface FilterProps {
  sortOptions: any;
  handleSort: (field: string) => void;
}

export const Filter = memo<FilterProps>(({ sortOptions, handleSort }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Search />
      <SortColumns sortOptions={sortOptions} handleSort={handleSort} />
    </div>
  );
});

const Search = memo(function Search() {
  const { t } = useTranslation();
  const classes = useStyles();
  const [value, setValue] = useState('');

  const handleValue = useCallback(e => {
    setValue(e.target.value);
  }, []);

  return (
    <InputBase
      className={classes.search}
      value={value}
      onChange={handleValue}
      fullWidth={true}
      placeholder={t('Filter-Search')}
    />
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

const SortColumns = memo<FilterProps>(function SortColumns({ sortOptions, handleSort }) {
  const classes = useStyles();

  const { sort, sortDirection } = sortOptions;
  return (
    <div className={classes.sortColumns}>
      {SORT_COLUMNS.map(({ label, sortKey, className }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sort === 'datetime' ? sortDirection : 'none'}
          onChange={handleSort}
          className={className ? classes[className] : ''}
        />
      ))}
    </div>
  );
});
