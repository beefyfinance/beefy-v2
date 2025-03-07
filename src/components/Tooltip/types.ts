import {
  type Placement,
  type ReferenceType,
  type UseFloatingReturn,
  type UseInteractionsReturn,
} from '@floating-ui/react';
import type { MutableRefObject } from 'react';

export type TooltipOptions = {
  placement?: Placement;
  offset?: number;
  openOnClick?: boolean;
  openOnHover?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  openOnFocus?: boolean;
  variant?: 'light' | 'dark';
  layer?: 0 | 1 | 2;
  size?: 'normal' | 'compact';
  arrowWidth?: number;
  arrowHeight?: number;
  disabled?: boolean;
};

export type TooltipData<TRef extends ReferenceType = Element> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  arrow: {
    ref: MutableRefObject<SVGSVGElement | null>;
    width: number;
    height: number;
  };
} & UseInteractionsReturn &
  UseFloatingReturn<TRef> &
  Required<Pick<TooltipOptions, 'variant' | 'size' | 'layer'>>;
