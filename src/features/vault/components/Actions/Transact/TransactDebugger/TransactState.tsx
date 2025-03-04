import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../../store.ts';
import type { BeefyState } from '../../../../../../redux-types.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function selectTransactState(state: BeefyState) {
  return state.ui.transact;
}

export const TransactState = memo(function TransactState() {
  const classes = useStyles();
  const data = useAppSelector(selectTransactState);

  return <div className={classes.item}>{JSON.stringify(data, null, 2)}</div>;
});
