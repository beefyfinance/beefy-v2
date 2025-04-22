import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { memo } from 'react';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader/SortColumnHeader.tsx';
import { styles } from './styles.ts';
import type { SortedOptions } from '../../hook.ts';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

interface FilterProps {
  sortOptions: SortedOptions;
  handleSort: (field: SortedOptions['sort']) => void;
  handleSearchText: (newValue: string) => void;
  searchText: string;
}

export const Filter = memo(function Filter({
  sortOptions,
  handleSort,
  handleSearchText,
  searchText,
}: FilterProps) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <SearchInput
        className={inputCss}
        onValueChange={handleSearchText}
        value={searchText}
        focusOnSlash={true}
      />
      <SortColumns sortOptions={sortOptions} handleSort={handleSort} />
    </div>
  );
});

const inputCss = css({
  md: {
    maxWidth: '75%',
  },
});

const SORT_COLUMNS: {
  label: string;
  sortKey: SortedOptions['sort'];
  cssKey?: keyof typeof styles;
}[] = [
  { label: 'Dashboard-Filter-AtDeposit', sortKey: 'atDeposit', cssKey: 'hideSm' },
  { label: 'Dashboard-Filter-Now', sortKey: 'now', cssKey: 'hideSm' },
  { label: 'Dashboard-Filter-Yield', sortKey: 'yield', cssKey: 'hideSm' },
  { label: 'Dashboard-Filter-Pnl', sortKey: 'pnl' },
  { label: 'Dashboard-Filter-Apy', sortKey: 'apy', cssKey: 'hideMd' },
  { label: 'Dashboard-Filter-DailyYield', sortKey: 'dailyYield', cssKey: 'hideMd' },
];

interface SortColumnsProps {
  sortOptions: SortedOptions;
  handleSort: (field: SortedOptions['sort']) => void;
}

const SortColumns = memo(function SortColumns({ sortOptions, handleSort }: SortColumnsProps) {
  const classes = useStyles();

  const { sort, sortDirection } = sortOptions;
  return (
    <div className={classes.sortColumns}>
      {SORT_COLUMNS.map(({ label, sortKey, cssKey }) => (
        <SortColumnHeader
          key={label}
          label={label}
          sortKey={sortKey}
          sorted={sort === sortKey ? sortDirection : 'none'}
          onChange={handleSort}
          css={cssKey ? styles[cssKey] : undefined}
        />
      ))}
    </div>
  );
});
