import { type ReferenceType } from '@floating-ui/react';
import type { TooltipData, TooltipOptions } from './types';
export declare function useTooltip<TRef extends ReferenceType = Element>({ placement, offset, openOnClick, openOnHover, hoverOpenDelay, hoverCloseDelay, variant, size, arrowWidth, arrowHeight, disabled, layer, }?: TooltipOptions): TooltipData<TRef>;
