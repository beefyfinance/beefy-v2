import { memo, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import { AUTO_REFRESH_SECONDS, styles } from './styles';
import { Refresh } from '@material-ui/icons';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { transactFetchQuotes } from '../../../../../data/actions/transact';
import { selectTransactSelectedQuoteId } from '../../../../../data/selectors/transact';

const useStyles = makeStyles(styles);

export type QuoteTitleRefreshProps = {
  title: string;
  enableRefresh?: boolean;
  className?: string;
};
export const QuoteTitleRefresh = memo<QuoteTitleRefreshProps>(function ({
  title,
  enableRefresh = false,
  className,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleRefresh = useCallback(() => {
    dispatch(transactFetchQuotes());
  }, [dispatch]);

  return (
    <div className={clsx(classes.holder, className)}>
      <div className={classes.title}>{title}</div>
      {enableRefresh ? (
        <button className={classes.refreshButton} onClick={handleRefresh}>
          <Refresh className={classes.refreshIcon} />
        </button>
      ) : null}
    </div>
  );
});
