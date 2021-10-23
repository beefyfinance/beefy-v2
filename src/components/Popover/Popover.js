import { makeStyles, Typography, Popper, Box } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import styles from './styles';

const useStyles = makeStyles(styles);

const Popover = ({ title, content, children, solid, size = 'sm', placement = 'top-end' }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [arrowRef, setArrowRef] = useState(null);

  const toggleOpen = useCallback(() => {
    setIsOpen(open => !open);
  }, [setIsOpen]);

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div>
        <Box
          as="span"
          ref={setAnchorEl}
          onClick={toggleOpen}
          className={[classes.dot, classes[`size_${size}`]].join(' ')}
        >
          ?
        </Box>
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

export default memo(Popover);
