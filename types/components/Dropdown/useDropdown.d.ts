import { type ReferenceType } from '@floating-ui/react';
import type { DropdownData, DropdownOptions } from './types';
export declare function useDropdown<TRef extends ReferenceType = Element>({ open: controlledOpen, onChange: controlledOnChange, placement, offset, openOnClick, openOnHover, hoverOpenDelay, hoverCloseDelay, closeOnClickAway, variant, arrowEnabled, arrowWidth, arrowHeight, arrowOffset, disabled, layer, reference, positionReference, autoWidth, autoHeight, }?: DropdownOptions): DropdownData<TRef>;
