import type { MouseEventHandler, ReactNode } from 'react';
import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import type { PopperPlacementType } from '@material-ui/core';
import { ClickAwayListener, makeStyles, Popper, setRef } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: PopperPlacementType;
  onClick?: () => void;
  triggerClass?: string;
  tooltipClass?: string;
  arrowClass?: string;
  contentClass?: string;
  disabled?: boolean;
  onlyClick?: boolean;
};

export const Tooltip = memo(
  forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
    {
      content,
      children,
      triggerClass,
      tooltipClass,
      arrowClass,
      contentClass,
      placement = 'top-end',
      disabled = false,
      onClick,
      onlyClick,
    },
    ref
  ) {
    const baseClasses = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

    const handleOpen = useCallback(() => {
      if (!disabled) {
        setIsOpen(true);
      }
    }, [setIsOpen, disabled]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      e => {
        if (!disabled) {
          e.stopPropagation();
          e.preventDefault();
          if (!onlyClick) {
            setIsOpen(true);
          } else {
            setIsOpen(!isOpen);
          }
          if (onClick) {
            onClick();
          }
        }
      },
      [disabled, isOpen, onClick, onlyClick]
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

    const setTriggerRef = useCallback(
      (element: HTMLDivElement) => {
        setRef(ref, element);
        setAnchorEl(element);
      },
      [setAnchorEl, ref]
    );

    const onMouseEnter = useCallback(() => {
      if (!onlyClick) {
        handleOpen();
      }
    }, [handleOpen, onlyClick]);

    const onMouseLeave = useCallback(() => {
      if (!onlyClick) {
        handleClose();
      }
    }, [handleClose, onlyClick]);

    return (
      <ClickAwayListener onClickAway={handleClose}>
        <div
          className={clsx(baseClasses.trigger, triggerClass)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={handleClick}
          ref={setTriggerRef}
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
  })
);
