import { memo } from 'react';
import { AlertWarning } from '../../../../components/Alerts';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  notice: {
    marginBottom: '24px',
  },
}));

export const EmeraldGasNotice = memo(function () {
  const classes = useStyles();
  return (
    <AlertWarning className={classes.notice}>
      Please ensure your transaction's gas limit is under 10,000,000. Oasis RPCs are currently
      overestimating the amount of gas needed for a transaction.
    </AlertWarning>
  );
});
