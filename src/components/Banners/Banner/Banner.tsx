import type { ReactNode } from 'react';
import React, { memo } from 'react';
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
};
export const Banner = memo<BannerProps>(function Banner({ icon, text, onClose, className }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.banner, className)}>
      <div className={classes.box}>
        <div className={classes.content}>
          {icon ? <div className={classes.icon}>{icon}</div> : null}
          <div className={classes.text}>{text}</div>
        </div>
        {onClose ? <Clear onClick={onClose} className={classes.cross} /> : null}
      </div>
    </div>
  );
});
