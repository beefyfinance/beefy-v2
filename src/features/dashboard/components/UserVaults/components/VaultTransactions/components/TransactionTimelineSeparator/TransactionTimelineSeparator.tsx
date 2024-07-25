import { memo } from 'react';
import { makeStyles, type Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  separator: {
    ...theme.typography['subline-sm'],
    color: theme.palette.text.dark,
    textAlign: 'center' as const,
    padding: '4px',
  },
}));

export const TransactionTimelineSeparator = memo(function TransactionTimelineSeparator() {
  const classes = useStyles();
  return (
    <div className={classes.separator}>
      {
        'Only transactions for your current deposit are included in the PNL analytics for this position'
      }
    </div>
  );
});
