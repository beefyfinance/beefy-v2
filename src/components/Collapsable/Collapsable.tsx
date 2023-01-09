import { Collapse, makeStyles } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import React, { memo, ReactNode, useCallback, useState } from 'react';
import { Button } from '../Button';
import { styles } from './styles';

interface CollapsableProps {
  openByDefault?: boolean;
  children: ReactNode;
  containerClassName?: string;
  titleClassName?: string;
  title: string;
}

const useStyles = makeStyles(styles);

export const Collapsable = memo<CollapsableProps>(function ({
  openByDefault = false,
  children,
  containerClassName,
  titleClassName,
  title,
}) {
  const [open, setOpen] = useState<boolean>(openByDefault);

  const classes = useStyles();

  const handleCollapse = useCallback(() => {
    setOpen(prevStatus => !prevStatus);
  }, []);

  return (
    <div className={clsx(containerClassName, classes.container)}>
      <Button fullWidth={true} onClick={handleCollapse} className={classes.title}>
        <div className={titleClassName}>{title}</div>
        {open ? (
          <ExpandLess className={classes.titleIcon} />
        ) : (
          <ExpandMore className={classes.titleIcon} />
        )}
      </Button>
      <Collapse in={open} timeout="auto">
        {children}
      </Collapse>
    </div>
  );
});
