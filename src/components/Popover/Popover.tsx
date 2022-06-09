import { makeStyles, Popper, PopperPlacementType } from '@material-ui/core';
import React, { memo, ReactNode, useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { styles } from './styles';
import { HelpOutline } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles(styles);
const _Popover = ({
  title,
  content,
  children,
  size = 'sm',
  placement = 'top-end',
}: {
  title?: string;
  content?: string;
  size?: string;
  placement?: PopperPlacementType;
  children?: ReactNode;
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState(null);
  const [_placement, setPlacement] = React.useState<PopperPlacementType>(placement);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    setIsOpen(prev => !prev);
    setPlacement(placement);
  };

  const handlePopoverClose = () => {
    setIsOpen(false);
  };
  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
        <div
          onClick={handlePopoverOpen}
          ref={setAnchorEl}
          className={clsx(classes.dot, classes[`size_${size}`])}
        >
          <HelpOutline />
        </div>
        <Popper
          id={title}
          open={isOpen}
          anchorEl={anchorEl}
          placement={_placement}
          modifiers={{
            arrow: {
              enabled: true,
              element: arrowRef,
            },
          }}
          className={classes.popper}
        >
          <span className={classes.arrow} ref={setArrowRef} />
          <div className={[classes.popover, 'popover'].join(' ')}>
            {title && <div className={classes.title}>{title}</div>}
            {content ? <div>{content}</div> : <>{children}</>}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export const Popover = memo(_Popover);
