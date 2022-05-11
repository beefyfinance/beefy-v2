import { memo, ReactNode } from 'react';
import { ErrorOutline, SvgIconComponent } from '@material-ui/icons';
import { styles } from './styles';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

export type AlertProps = {
  IconComponent: SvgIconComponent;
  children: ReactNode;
  className?: string;
};
export const Alert = memo<AlertProps>(function Alert({ IconComponent, className, children }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.alert, className)}>
      <IconComponent className={classes.icon} />
      <div className={classes.content}>{children}</div>
    </div>
  );
});

export const AlertWarning = memo<Omit<AlertProps, 'IconComponent'>>(function AlertWarning({
  className,
  children,
}) {
  const classes = useStyles();
  return (
    <Alert
      IconComponent={ErrorOutline}
      children={children}
      className={clsx(classes.warning, className)}
    />
  );
});
