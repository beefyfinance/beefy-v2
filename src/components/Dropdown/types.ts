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
  reference?: MutableRefObject<Element | null>;
  placement?: Placement;
  offset?: number;
  openOnClick?: boolean;
  closeOnClickAway?: boolean;
  variant?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'none';
  arrowEnabled?: boolean;
  arrowWidth?: number;
  arrowHeight?: number;
  arrowOffset?: number;
  disabled?: boolean;
  layer?: 0 | 1 | 2;
  autoWidth?: boolean;
  autoHeight?: boolean;
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
} & UseInteractionsReturn &
  UseFloatingReturn<TRef> &
  Pick<DropdownOptions, 'variant'> &
  Required<Pick<DropdownOptions, 'size' | 'layer'>>;
