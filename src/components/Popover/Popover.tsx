import { makeStyles, Typography, Popper, Box, BoxProps, Fade } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { PopoverProps } from './PopoverProps';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
const _Popover: React.FC<PopoverProps> = ({
  title,
  content,
  children,
  size = 'sm',
  placement = 'top-end',
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState(null);

  const handlePopoverOpen = () => {
    setIsOpen(true);
  };

  const handlePopoverClose = () => {
    setIsOpen(false);
  };

  const boxProps: BoxProps & { ref: any } = {
    ref: setAnchorEl,
    onClick: handlePopoverOpen,
    className: [classes.dot, classes[`size_${size}`]].join(' '),
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div onMouseEnter={handlePopoverOpen} onMouseLeave={handlePopoverClose}>
        <Box {...boxProps}>?</Box>
        <Popper
          id={title}
          open={isOpen}
          anchorEl={anchorEl}
          placement={placement}
          disablePortal={true}
          modifiers={{
            flip: {
              enabled: true,
            },
            preventOverflow: {
              enabled: true,
              boundariesElement: 'scrollParent',
            },
            arrow: {
              enabled: true,
              element: arrowRef,
            },
          }}
          className={classes.popper}
        >
          <span className={classes.arrow} ref={setArrowRef} />
          <div className={[classes.popover, 'popover'].join(' ')}>
            {title && <Typography className={classes.title}>{title}</Typography>}
            {content ? <Typography>{content}</Typography> : <>{children}</>}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export const Popover = memo(_Popover);
