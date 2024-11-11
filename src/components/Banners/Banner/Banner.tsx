import type { ReactNode } from 'react';
import { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type BannerProps = {
  icon?: ReactNode;
  text: ReactNode;
  onClose?: () => void;
  className?: string;
  variant?: 'info' | 'warning' | 'error';
  children?: ReactNode;
};

export const Banner = memo<BannerProps>(function Banner({
  icon,
  text,
  onClose,
  variant = 'info',
  children,
  className,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.banner, classes[variant || 'info'], className)}>
      <div className={classes.box}>
        <div className={classes.content}>
          {icon ? <div className={classes.icon}>{icon}</div> : null}
          <div className={classes.text}>{text}</div>
        </div>
        {onClose ? <Clear onClick={onClose} className={classes.cross} /> : null}
      </div>
      {children}
    </div>
  );
});
