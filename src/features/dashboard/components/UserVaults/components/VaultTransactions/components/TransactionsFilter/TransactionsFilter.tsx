import { makeStyles, Theme } from '@material-ui/core';
import { memo } from 'react';
import { SortColumnHeader } from '../../../../../../../../components/SortColumnHeader';
import { InfoGrid } from '../InfoGrid';
import { Row } from '../Row/Row';

const SORT_COLUMNS: {
  label: string;
  sortKey: string;
  className?: string;
}[] = [
  { label: 'Dashboard-Filter-Amount', sortKey: 'amount' },
  { label: 'Dashboard-Filter-Balance', sortKey: 'balance' },
  { label: 'Dashboard-Filter-MooTokenBal', sortKey: 'mooTokenBal' },
  { label: 'Dashboard-Filter-UsdBalance', sortKey: 'usdBalance' },
];

const useStyles = makeStyles((theme: Theme) => ({
  filter: {
    borderRadius: '8px 8px 0px 0px',
  },
  justifyStart: {
    justifyContent: 'start',
  },
}));

export const TransactionsFilter = memo(function SortColumns() {
  const classes = useStyles();
  return (
    <Row className={classes.filter}>
      <SortColumnHeader
        label={'Dashboard-Filter-Date'}
        sortKey={'datetime'}
        sorted={'none'}
        onChange={() => console.log('a')}
        className={classes.justifyStart}
      />
      <InfoGrid>
        {SORT_COLUMNS.map(({ label, sortKey, className }) => (
          <SortColumnHeader
            key={label}
            label={label}
            sortKey={sortKey}
            sorted={'none'}
            onChange={() => console.log('a')}
          />
        ))}
      </InfoGrid>
    </Row>
  );
});
