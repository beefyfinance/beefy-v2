import { makeStyles, type Theme } from '@material-ui/core';
import clsx from 'clsx';
import { memo } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingInline: '16px',
    [theme.breakpoints.up('md')]: {
      paddingInline: '24px',
    },
  },
  'width-xl': {},
  'width-lg': {
    [theme.breakpoints.up('lg')]: {
      maxWidth: '1296px',
    },
  },
  'width-md': {
    [theme.breakpoints.up('md')]: {
      maxWidth: '960px',
    },
  },
  'width-sm': {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '600px',
    },
  },
  'width-xs': {
    [theme.breakpoints.up('xs')]: {
      maxWidth: '444px',
    },
  },
}));

interface ContainerProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

export const Container = memo<ContainerProps>(function Container({
  maxWidth = 'xl',
  children,
  className,
}) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, className, classes[`width-${maxWidth}`])}>{children}</div>
  );
});
