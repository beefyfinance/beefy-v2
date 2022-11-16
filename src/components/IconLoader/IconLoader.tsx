import { memo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { DEFAULT_SIZE } from '../AssetsImage/styles';

const useStyles = makeStyles(styles);

export type IconLoaderProps = {
  size?: number;
  className?: string;
};

export const IconLoader = memo<IconLoaderProps>(function IconLoader({
  size = DEFAULT_SIZE,
  className,
}) {
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.holder, className)}
      style={size !== DEFAULT_SIZE ? { width: size, height: size } : undefined}
    />
  );
});
