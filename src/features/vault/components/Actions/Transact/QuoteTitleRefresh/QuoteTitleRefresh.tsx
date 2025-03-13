import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import Refresh from '../../../../../../images/icons/mui/Refresh.svg?react';
import { css, type CssStyles } from '@repo/styles/css';
import { useAppDispatch } from '../../../../../../store.ts';
import { transactFetchQuotes } from '../../../../../data/actions/transact.ts';

const useStyles = legacyMakeStyles(styles);

export type QuoteTitleRefreshProps = {
  title: string;
  enableRefresh?: boolean;
  css?: CssStyles;
};
export const QuoteTitleRefresh = memo(function QuoteTitleRefresh({
  title,
  enableRefresh = false,
  css: cssProp,
}: QuoteTitleRefreshProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleRefresh = useCallback(() => {
    dispatch(transactFetchQuotes());
  }, [dispatch]);

  return (
    <div className={css(styles.holder, cssProp)}>
      <div className={classes.title}>{title}</div>
      {enableRefresh ? (
        <button type="button" className={classes.refreshButton} onClick={handleRefresh}>
          <Refresh className={classes.refreshIcon} />
        </button>
      ) : null}
    </div>
  );
});
