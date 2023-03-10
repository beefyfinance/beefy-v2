import { makeStyles, Theme } from '@material-ui/core';
import React, { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 0px',
  },
}));

export const GraphLoader = memo(function _GraphLoader({ imgHeight = 200 }: { imgHeight?: number }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img
        style={{ height: imgHeight }}
        src={require('../../../../images/tech-loader.gif').default}
        alt="loader"
      />
    </div>
  );
});
