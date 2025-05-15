import {
  type HTMLProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  arrow as arrowMiddleware,
  autoUpdate,
  flip as flipMiddleware,
  offset as offsetMiddleware,
  type ReferenceType,
  shift as shiftMiddleware,
  size as sizeMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import type { DropdownData, DropdownOptions } from './types.ts';
import { isDefined } from '../../features/data/utils/array-utils.ts';

export function useDropdown<TRef extends ReferenceType = Element>({
  open: controlledOpen,
  onChange: controlledOnChange,
  placement = 'bottom-start',
  offset = 4,
  openOnClick = true,
  closeOnClickAway = true,
  variant = undefined,
  arrowEnabled = false,
  arrowWidth = 14,
  arrowHeight = 7,
  arrowOffset,
  disabled = false,
  layer = 0,
  reference,
  autoWidth = false,
  autoHeight = false,
}: DropdownOptions = {}): DropdownData<TRef> {
  const [uncontrolledOpen, uncontrolledOnChange] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const onOpenChange = controlledOnChange ?? uncontrolledOnChange;
  const arrowRef = useRef<SVGSVGElement | null>(null);

  const middleware = useMemo(() => {
    const offsetWithArrow = arrowEnabled ? offset + arrowHeight : offset;
    return [
      offsetWithArrow > 0 ? offsetMiddleware(offsetWithArrow) : undefined,
      flipMiddleware({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 16,
      }),
      shiftMiddleware({ padding: 16 }),
      arrowEnabled ? arrowMiddleware({ element: arrowRef, padding: 16 }) : undefined,
      autoWidth || autoHeight ?
        sizeMiddleware({
          padding: 16,
          apply({ availableWidth, availableHeight, elements }) {
            if (autoWidth) {
              elements.floating.style.width =
                elements.reference.getBoundingClientRect().width + 'px';
              elements.floating.style.maxWidth = availableWidth + 'px';
            }
            if (autoHeight) {
              elements.floating.style.maxHeight = availableHeight + 'px';
            }
          },
        })
      : undefined,
    ].filter(isDefined);
  }, [offset, arrowHeight, placement, arrowRef, arrowEnabled, autoWidth, autoHeight]);

  const data = useFloating<TRef>({
    placement,
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
    middleware,
  });
  const { context } = data;
  const click = useClick(context, {
    enabled: !disabled && openOnClick,
    stickIfOpen: true,
  });
  const dismiss = useDismiss(context, {
    enabled: !disabled && closeOnClickAway,
  });
  const role = useRole(context, { role: 'dialog' });
  const interactions = useInteractions([click, dismiss, role]);
  const arrow = useMemo(
    () =>
      arrowEnabled ?
        { width: arrowWidth, height: arrowHeight, ref: arrowRef, staticOffset: arrowOffset }
      : false,
    [arrowEnabled, arrowWidth, arrowHeight, arrowRef, arrowOffset]
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

  const referenceElement = reference?.current;
  const { setReference } = data.refs;
  useLayoutEffect(() => {
    if (reference && referenceElement !== undefined) {
      setReference(referenceElement);
    }
  }, [setReference, reference, referenceElement]);

  useEffect(() => {
    if (disabled && open) {
      onOpenChange(false);
    }
  }, [open, disabled, onOpenChange]);

  return useMemo(
    () => ({
      open,
      setOpen: onOpenChange,
      variant,
      arrow,
      ...interactions,
      getReferenceProps,
      ...data,
      layer,
      manualReference: !!reference,
    }),
    [open, onOpenChange, variant, arrow, data, interactions, getReferenceProps, layer, reference]
  );
}
