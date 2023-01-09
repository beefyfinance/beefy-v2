import { memo } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TextLoaderProps = {
  placeholder: string;
  className?: string;
};

export const TextLoader = memo<TextLoaderProps>(function TextLoader({ placeholder, className }) {
  const classes = useStyles();

  return (
    <span className={clsx(classes.holder, className)}>
      <span className={classes.placeholder}>{placeholder}</span>
      <span className={classes.loader} />
    </span>
  );
});
