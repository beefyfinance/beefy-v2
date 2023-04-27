import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { SortColumnHeader } from '../../../../../../../../components/SortColumnHeader';
import { InfoGrid } from '../InfoGrid';
import { Row } from '../../../Row/Row';
import type { SortedOptions } from '../../hook';

const SORT_COLUMNS: {
  label: string;
  sortKey: string;
  className?: string;
}[] = [
  { label: 'Dashboard-Filter-Amount', sortKey: 'amount' },
  { label: 'Dashboard-Filter-Balance', sortKey: 'balance' },
  { label: 'Dashboard-Filter-MooTokens', sortKey: 'mooTokenBal' },
  { label: 'Dashboard-Filter-UsdBalance', sortKey: 'usdBalance' },
];

const useStyles = makeStyles((theme: Theme) => ({
  filter: {
    borderRadius: '8px 8px 0px 0px',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  justifyStart: {
    justifyContent: 'start',
  },
}));

interface TransactionsFilterProps {
  sortOptions: SortedOptions;
  handleSort: (field: string) => void;
}

export const TransactionsFilter = memo<TransactionsFilterProps>(function SortColumns({
  handleSort,
  sortOptions,
}) {
  const classes = useStyles();

  const { sort, sortDirection } = sortOptions;

  return (
    <Row className={classes.filter}>
      <SortColumnHeader
        label={'Dashboard-Filter-Date'}
        sortKey={'datetime'}
        sorted={sort === 'datetime' ? sortDirection : 'none'}
        onChange={handleSort}
        className={classes.justifyStart}
      />
      <InfoGrid>
        {SORT_COLUMNS.map(({ label, sortKey }) => (
          <SortColumnHeader
            key={label}
            label={label}
            sortKey={sortKey}
            sorted={sort === sortKey ? sortDirection : 'none'}
            onChange={handleSort}
          />
        ))}
      </InfoGrid>
    </Row>
  );
});
