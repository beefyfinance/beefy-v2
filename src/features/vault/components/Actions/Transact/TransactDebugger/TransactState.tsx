import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../../store';
import type { BeefyState } from '../../../../../../redux-types';
import { styles } from './styles';

const useStyles = makeStyles(styles);

function selectTransactState(state: BeefyState) {
  return state.ui.transact;
}

export const TransactState = memo(function TransactState() {
  const classes = useStyles();
  const data = useAppSelector(selectTransactState);

  return <div className={classes.item}>{JSON.stringify(data, null, 2)}</div>;
});
