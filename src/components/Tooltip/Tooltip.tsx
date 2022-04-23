import React, { memo, MouseEventHandler, ReactNode, useCallback, useMemo, useState } from 'react';
import { ClickAwayListener, makeStyles, Popper, PopperPlacementType } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: PopperPlacementType;
  triggerClass?: string;
  tooltipClass?: string;
  arrowClass?: string;
  contentClass?: string;
};

export const Tooltip = memo<TooltipProps>(function Tooltip({
  content,
  children,
  triggerClass,
  tooltipClass,
  arrowClass,
  contentClass,
  placement = 'top-end',
}) {
  const baseClasses = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      e.stopPropagation();
      e.preventDefault();
      setIsOpen(true);
    },
    [setIsOpen]
  );

  const modifiers = useMemo(
    () => ({
      arrow: {
        enabled: true,
        element: arrowRef,
      },
    }),
    [arrowRef]
  );

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div
        className={clsx(baseClasses.trigger, triggerClass)}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        onClick={handleClick}
        ref={setAnchorEl}
      >
        {children}
        <Popper
          open={isOpen}
          className={clsx(baseClasses.tooltip, tooltipClass)}
          anchorEl={anchorEl}
          modifiers={modifiers}
          placement={placement}
        >
          <div className={clsx(baseClasses.arrow, arrowClass)} ref={setArrowRef} />
          <div className={clsx(baseClasses.content, contentClass)}>{content}</div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
});
