import React, {
  forwardRef,
  memo,
  type TouchEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
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
  /** no event for touch devices as react adds the touch event passively */
  onTriggerClick?: (e: MouseEvent<HTMLDivElement> | undefined) => void;
  propagateTriggerClick?:
    | boolean
    | ((e: MouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => boolean);
  onTooltipClick?: MouseEventHandler<HTMLDivElement>;
  propagateTooltipClick?: boolean | ((e: MouseEvent<HTMLDivElement>) => boolean);
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
      onTriggerClick,
      onTooltipClick,
      propagateTriggerClick = false,
      propagateTooltipClick = false,
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
        console.log(`setIsOpen(true) from handleMouseEnter`);
        setIsOpen(true);
      }
    }, [setIsOpen, disabled, triggers]);

    const handleMouseLeave = useCallback(() => {
      if (triggers & TRIGGERS.HOVER) {
        console.log(`setIsOpen(false) from handleMouseLeave`);
        setIsOpen(false);
      }
    }, [setIsOpen, triggers]);

    const handleClickAway = useCallback(() => {
      console.log(`setIsOpen(false) from handleClickAway`);
      setIsOpen(false);
    }, [setIsOpen]);

    const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      e => {
        if (
          !(typeof propagateTriggerClick === 'function'
            ? propagateTriggerClick(e)
            : propagateTriggerClick)
        ) {
          e.stopPropagation();
        }

        if (!disabled) {
          if (onTriggerClick) {
            onTriggerClick(e);
          }

          if (triggers & TRIGGERS.CLICK) {
            console.log(`setIsOpen(!isOpen -> ${!isOpen}) from handleClick`);
            setIsOpen(!isOpen);
          }
        }
      },
      [disabled, isOpen, onTriggerClick, triggers, setIsOpen, propagateTriggerClick]
    );

    const handleTouch = useCallback<TouchEventHandler<HTMLDivElement>>(
      e => {
        if (
          !(typeof propagateTriggerClick === 'function'
            ? propagateTriggerClick(e)
            : propagateTriggerClick)
        ) {
          e.stopPropagation();
        }

        if (!disabled) {
          if (onTriggerClick) {
            onTriggerClick(undefined);
          }

          if (triggers & TRIGGERS.CLICK) {
            console.log(`setIsOpen(!isOpen -> ${!isOpen}) from handleTouch`);
            setIsOpen(!isOpen);
          }
        }
      },
      [disabled, isOpen, onTriggerClick, triggers, setIsOpen, propagateTriggerClick]
    );

    const handlePopperClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      e => {
        if (
          !(typeof propagateTooltipClick === 'function'
            ? propagateTooltipClick(e)
            : propagateTooltipClick)
        ) {
          e.stopPropagation();
        }

        if (onTooltipClick) {
          onTooltipClick(e);
        }
      },
      [onTooltipClick, propagateTooltipClick]
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
        if (element) {
          element.addEventListener('touchstart', (e: TouchEvent) => e.preventDefault());
        }
      },
      [setAnchorEl, ref]
    );

    const ClickAway = useMemo(() => {
      // multiple click away listeners don't work well together, only one gets triggered
      return isOpen ? ClickAwayListener : DummyClickAwayListener;
    }, [isOpen]);

    return (
      <>
        <div
          className={clsx(baseClasses.trigger, triggerClass)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouch}
          onClick={handleClick}
          ref={setTriggerRef}
        >
          {children}
        </div>
        <ClickAway onClickAway={handleClickAway}>
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
        </ClickAway>
      </>
    );
  })
);
