import { Collapse, IconButton, makeStyles } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import React, { memo, ReactNode, useCallback, useState } from 'react';
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
    <>
      <div className={clsx(containerClassName, classes.container)}>
        <div className={classes.title}>
          <div className={titleClassName}>{title}</div>
          <IconButton className={classes.iconButton} onClick={handleCollapse}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
        <Collapse in={open} timeout="auto">
          {children}
        </Collapse>
      </div>
    </>
  );
});
