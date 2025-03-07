import { type HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip as flipMiddleware,
  offset as offsetMiddleware,
  type ReferenceType,
  shift as shiftMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import type { TooltipData, TooltipOptions } from './types.ts';

export function useTooltip<TRef extends ReferenceType = Element>({
  placement = 'top-end',
  offset = 4,
  openOnClick = true,
  openOnHover = true,
  hoverOpenDelay = 0,
  hoverCloseDelay = 0,
  variant = 'light',
  size = 'normal',
  arrowWidth = 14,
  arrowHeight = 7,
  disabled = false,
  layer = 0,
}: TooltipOptions = {}): TooltipData<TRef> {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const data = useFloating<TRef>({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(offset + arrowHeight),
      flipMiddleware({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 16,
      }),
      shiftMiddleware({ padding: 16 }),
      arrowMiddleware({ element: arrowRef, padding: 16 }),
    ],
  });
  const { context } = data;
  const hover = useHover(context, {
    move: false,
    enabled: !disabled && openOnHover,
    mouseOnly: openOnClick,
    delay: {
      open: hoverOpenDelay,
      close: hoverCloseDelay,
    },
  });
  const click = useClick(context, {
    enabled: !disabled && openOnClick,
    stickIfOpen: true,
    ignoreMouse: openOnHover,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const interactions = useInteractions([click, hover, dismiss, role]);
  const arrow = useMemo(
    () => ({ width: arrowWidth, height: arrowHeight, ref: arrowRef }),
    [arrowWidth, arrowHeight, arrowRef]
  );
  const baseGetReferenceProps = interactions.getReferenceProps;
  const getReferenceProps = useCallback(
    (userProps?: HTMLProps<Element>): Record<string, unknown> => {
      return baseGetReferenceProps({
        ...(userProps || {}),
        onClick: e => {
          e.preventDefault();
          userProps?.onClick?.(e);
        },
      });
    },
    [baseGetReferenceProps]
  );

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [open, disabled, setOpen]);

  return useMemo(
    () => ({
      open: open,
      setOpen,
      variant,
      size,
      arrow,
      ...interactions,
      getReferenceProps,
      ...data,
      layer,
    }),
    [open, setOpen, variant, size, arrow, interactions, data, getReferenceProps, layer]
  );
}
