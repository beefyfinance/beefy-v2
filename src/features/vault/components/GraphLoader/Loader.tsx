import { makeStyles } from '@material-ui/core';
import { memo, type PropsWithChildren } from 'react';
import techLoaderUrl from '../../../../images/tech-loader.gif';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    flexDirection: 'column',
    gap: '16px',
  },
}));

export type GraphLoaderProps = PropsWithChildren<{
  imgHeight?: number;
}>;

export const GraphLoader = memo<GraphLoaderProps>(function _GraphLoader({
  imgHeight = 200,
  children,
}) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img style={{ height: imgHeight }} src={techLoaderUrl} alt="loader" />
      {children}
    </div>
  );
});
