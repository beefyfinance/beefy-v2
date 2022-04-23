import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef, memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { Link, LinkProps } from 'react-router-dom';

const useStyles = makeStyles(styles);

export type CommonButtonProps = {
  children: ReactNode;
  className?: string;
  borderless?: boolean;
  fullWidth?: boolean;
  variant?: 'default' | 'filter' | 'success';
  component?: 'button' | 'a';
};

export type ButtonProps = CommonButtonProps &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export type ButtonLinkProps = CommonButtonProps & LinkProps;

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { children, className, borderless = false, fullWidth = false, variant = 'default', ...rest },
    ref
  ) {
    const classes = useStyles();

    return (
      <button
        {...rest}
        ref={ref}
        className={clsx(classes.button, classes[variant], className, {
          [classes.borderless]: borderless,
          [classes.fullWidth]: fullWidth,
        })}
      >
        {children}
      </button>
    );
  })
);

export const ButtonLink = memo<ButtonLinkProps>(function ButtonLink({
  children,
  className,
  borderless = false,
  fullWidth = false,
  variant = 'default',
  ...rest
}) {
  const classes = useStyles();

  return (
    <Link
      {...rest}
      className={clsx(classes.button, classes[variant], className, {
        [classes.borderless]: borderless,
        [classes.fullWidth]: fullWidth,
      })}
    >
      {children}
    </Link>
  );
});
