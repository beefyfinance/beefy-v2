import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  separator: css.raw({
    textStyle: 'subline.sm',
    color: 'text.dark',
    textAlign: 'center',
    padding: '4px',
  }),
});

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
