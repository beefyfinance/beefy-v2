import {
  makeStyles,
  Typography,
  Popper,
  Box,
  BoxProps,
  PopperPlacementType,
} from '@material-ui/core';
import React, { memo, ReactNode, useState } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import { styles } from './styles';

const useStyles = makeStyles(styles as any);
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
            {title && <Typography className={classes.title}>{title}</Typography>}
            {content ? <Typography>{content}</Typography> : <>{children}</>}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export const Popover = memo(_Popover);
