import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import techLoaderUrl from '../../../../images/tech-loader.gif';

const useStyles = makeStyles(() => ({
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
      <img style={{ height: imgHeight }} src={techLoaderUrl} alt="loader" />
    </div>
  );
});
