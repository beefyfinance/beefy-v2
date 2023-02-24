import { makeStyles, Theme } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { height: '200px' },
}));

export const Loader = memo(function () {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img
        className={classes.loader}
        src={require('../../../../../../images/tech-loader.gif').default}
        alt="loader"
      />
    </div>
  );
});
