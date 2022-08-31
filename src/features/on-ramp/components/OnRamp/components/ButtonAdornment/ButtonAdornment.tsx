import React, { ButtonHTMLAttributes, DetailedHTMLProps, memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type ButtonAdornmentProps = {
  children: ReactNode;
  onClick?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >['onClick'];
  className?: string;
};
export const ButtonAdornment = memo<ButtonAdornmentProps>(function ButtonAdornment({
  children,
  onClick,
  className,
}) {
  const classes = useStyles();

  return (
    <button className={clsx(classes.button, className)} onClick={onClick}>
      {children}
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
