import React, {
  forwardRef,
  memo,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ClickAwayListener,
  makeStyles,
  Popper,
  PopperPlacementType,
  setRef,
} from '@material-ui/core';
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
  disable?: boolean;
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
      disable = false,
    },
    ref
  ) {
    const baseClasses = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

    const handleOpen = useCallback(() => {
      if (!disable) {
        setIsOpen(true);
      }
    }, [setIsOpen, disable]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      e => {
        if (!disable) {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }
      },
      [setIsOpen, disable]
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

    return (
      <ClickAwayListener onClickAway={handleClose}>
        <div
          className={clsx(baseClasses.trigger, triggerClass)}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
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
