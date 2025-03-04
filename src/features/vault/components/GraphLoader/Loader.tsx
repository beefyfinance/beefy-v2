import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo, type PropsWithChildren } from 'react';
import techLoaderUrl from '../../../../images/tech-loader.gif';
import { css } from '@repo/styles/css';

const useStyles = legacyMakeStyles({
  container: css.raw({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    flexDirection: 'column',
    gap: '16px',
  }),
});

export type GraphLoaderProps = PropsWithChildren<{
  imgHeight?: number;
}>;

export const GraphLoader = memo(function GraphLoader({
  imgHeight = 200,
  children,
}: GraphLoaderProps) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <img style={{ height: imgHeight }} src={techLoaderUrl} alt="loader" />
      {children}
    </div>
  );
});
