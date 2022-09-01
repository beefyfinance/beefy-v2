import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { useAppSelector } from '../../../../../../store';
import { selectQuoteError, selectQuoteStatus } from '../../../../../data/selectors/on-ramp';
import { AlertError } from '../../../../../../components/Alerts';
import { ProviderSelect } from '../ProviderSelect';

const useStyles = makeStyles(styles);

const Rejected = memo(function Rejected() {
  const error = useAppSelector(selectQuoteError);
  return <AlertError>{error.message}</AlertError>;
});

export type QuoteBestProps = {
  className?: string;
};
export const QuoteBest = memo<QuoteBestProps>(function QuoteBest({ className }) {
  const classes = useStyles();
  const status = useAppSelector(selectQuoteStatus);

  return (
    <div className={clsx(classes.container, className)}>
      {status === 'rejected' ? <Rejected /> : <ProviderSelect pending={status !== 'fulfilled'} />}
    </div>
  );
});
