import type { MouseEventHandler, ReactNode } from 'react';
import React, { forwardRef, memo, useCallback, useMemo, useState, useId } from 'react';
import type { PopperPlacementType } from '@material-ui/core';
import { ClickAwayListener, makeStyles, Popper, setRef } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';
import type { ClickAwayListenerProps } from '@material-ui/core/ClickAwayListener/ClickAwayListener';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectTooltipIsOpen } from '../../features/data/selectors/tooltips';
import { closeTooltip, openTooltip } from '../../features/data/reducers/tooltips';

const useStyles = makeStyles(styles);

const DummyClickAwayListener = memo<ClickAwayListenerProps>(function DummyClickAwayListener({
  children,
}) {
  return <>{children}</>;
});

export enum TRIGGERS {
  CLICK = 1 << 0,
  HOVER = 1 << 1,
}

export type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  placement?: PopperPlacementType;
  onClick?: MouseEventHandler<HTMLDivElement>;
  triggerClass?: string;
  tooltipClass?: string;
  arrowClass?: string;
  contentClass?: string;
  disabled?: boolean;
  triggers?: number;
  group?: string;
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
      triggers = TRIGGERS.CLICK | TRIGGERS.HOVER,
      group = 'default',
    },
    ref
  ) {
    const id = useId();
    const baseClasses = useStyles();
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(state => selectTooltipIsOpen(state, id, group));
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);

    const setIsOpen = useCallback(
      (isOpen: boolean) => {
        if (isOpen) {
          dispatch(openTooltip({ id, group }));
        } else {
          dispatch(closeTooltip({ id, group }));
        }
      },
      [dispatch, id, group]
    );

    const handleMouseEnter = useCallback(() => {
      if (!disabled && triggers & TRIGGERS.HOVER) {
        setIsOpen(true);
      }
    }, [setIsOpen, disabled, triggers]);

    const handleMouseLeave = useCallback(() => {
      if (triggers & TRIGGERS.HOVER) {
        setIsOpen(false);
      }
    }, [setIsOpen, triggers]);

    const handleClickAway = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      e => {
        e.stopPropagation();
        if (!disabled) {
          if (onClick) {
            onClick(e);
          }

          if (!e.defaultPrevented && triggers & TRIGGERS.CLICK) {
            setIsOpen(!isOpen);
          }
        }
      },
      [disabled, isOpen, onClick, triggers, setIsOpen]
    );

    const handlePopperClick = useCallback<MouseEventHandler<HTMLDivElement>>(e => {
      e.stopPropagation();
    }, []);

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

    const ClickAway = useMemo(() => {
      // multiple click away listeners don't work well together, only one gets triggered
      return isOpen ? ClickAwayListener : DummyClickAwayListener;
    }, [isOpen]);

    return (
      <ClickAway onClickAway={handleClickAway}>
        <div
          className={clsx(baseClasses.trigger, triggerClass)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
            onClick={handlePopperClick}
          >
            <div className={clsx(baseClasses.arrow, arrowClass)} ref={setArrowRef} />
            <div className={clsx(baseClasses.content, contentClass)}>{content}</div>
          </Popper>
        </div>
      </ClickAway>
    );
  })
);
