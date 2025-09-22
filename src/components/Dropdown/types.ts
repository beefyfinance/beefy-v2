import {
  type Placement,
  type ReferenceType,
  type UseFloatingReturn,
  type UseInteractionsReturn,
} from '@floating-ui/react';
import type { MutableRefObject } from 'react';

export type DropdownOptions = {
  open?: boolean;
  onChange?: (open: boolean) => void;
  /** Manually set element for events and position */
  reference?: MutableRefObject<Element | null>;
  /** Manually set element for position  */
  positionReference?: MutableRefObject<Element | null>;
  placement?: Placement;
  offset?: number;
  openOnClick?: boolean;
  openOnHover?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  closeOnClickAway?: boolean;
  arrowEnabled?: boolean;
  arrowWidth?: number;
  arrowHeight?: number;
  arrowOffset?: number;
  disabled?: boolean;
  autoWidth?: boolean;
  autoHeight?: boolean;
  variant?: 'light' | 'dark' | 'button';
  layer?: 0 | 1 | 2;
};

export type DropdownData<TRef extends ReferenceType = Element> = {
  open: boolean;
  setOpen: (open: boolean) => void;
  arrow:
    | false
    | {
        ref: MutableRefObject<SVGSVGElement | null>;
        width: number;
        height: number;
      };
  manualReference: boolean;
  manualPositionReference: boolean;
} & UseInteractionsReturn &
  UseFloatingReturn<TRef> &
  Pick<DropdownOptions, 'variant'> &
  Required<Pick<DropdownOptions, 'layer'>>;
