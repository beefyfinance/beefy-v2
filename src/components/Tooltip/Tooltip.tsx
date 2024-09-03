import {
  forwardRef,
  memo,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type TouchEventHandler,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import type { PopperPlacementType } from '@material-ui/core';
import { makeStyles, Popper, setRef } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectTooltipIsOpen } from '../../features/data/selectors/tooltips';
import { closeTooltip, openTooltip, toggleTooltip } from '../../features/data/reducers/tooltips';
import { useClickAway } from './useClickAway';

const useStyles = makeStyles(styles);

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
  /** reduces padding/margins */
  compact?: boolean;
  dark?: boolean;
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
      compact = false,
      dark = false,
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

    const toggleOpen = useCallback(() => {
      dispatch(toggleTooltip({ id, group }));
    }, [dispatch, id, group]);

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

          if (!e.defaultPrevented && triggers & TRIGGERS.CLICK) {
            toggleOpen();
          }
        }
      },
      [disabled, onTriggerClick, triggers, toggleOpen, propagateTriggerClick]
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
            toggleOpen();
          }
        }
      },
      [disabled, onTriggerClick, triggers, toggleOpen, propagateTriggerClick]
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

    const { clickAwayRef, tooltipRef } = useClickAway<HTMLDivElement>(handleClickAway);

    const setTriggerRef = useCallback(
      (element: HTMLDivElement) => {
        setRef(ref, element);
        setRef(clickAwayRef, element);
        setAnchorEl(element);
        if (element) {
          element.addEventListener('touchstart', (e: TouchEvent) => e.preventDefault());
        }
      },
      [setAnchorEl, ref, clickAwayRef]
    );

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
        <Popper
          open={isOpen}
          className={clsx(
            baseClasses.tooltip,
            tooltipClass,
            compact ? baseClasses.compact : undefined,
            dark ? baseClasses.dark : undefined
          )}
          anchorEl={anchorEl}
          modifiers={modifiers}
          placement={placement}
          onClick={handlePopperClick}
          ref={tooltipRef}
        >
          <div className={clsx(baseClasses.arrow, arrowClass)} ref={setArrowRef} />
          <div className={clsx(baseClasses.content, contentClass)}>{content}</div>
        </Popper>
      </>
    );
  })
);
