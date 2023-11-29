import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../../store';
import type { BeefyState } from '../../../../../../redux-types';

const useStyles = makeStyles({
  container: {
    display: 'none',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: 'calc((100vw - 1296px)/2)',
    height: '100%',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    backgroundColor: '#111',
    '@media (min-width: 2000px)': {
      display: 'block',
    },
  },
});

function selectDebugData(state: BeefyState) {
  const transact = state.ui.transact;
  return transact;
}

export const TransactDebugger = memo(function TransactDebugger() {
  const classes = useStyles();
  const data = useAppSelector(selectDebugData);

  return <div className={classes.container}>{JSON.stringify(data, null, 2)}</div>;
});
