import { forwardRef, memo, type MouseEventHandler, type ReactNode } from 'react';
import { TooltipContent } from './TooltipContent.tsx';
import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipTrigger } from './TooltipTrigger.ts';
import type { TooltipOptions } from './types.ts';

export type DivWithTooltipProps = TooltipOptions & {
  tooltip: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const DivWithTooltip = memo(
  forwardRef<HTMLDivElement, DivWithTooltipProps>(function DivWithTooltip(
    { children, tooltip, onClick, className, ...rest },
    ref
  ) {
    return (
      <TooltipProvider {...rest}>
        <TooltipTrigger.div onClick={onClick} className={className} ref={ref}>
          {children}
        </TooltipTrigger.div>
        <TooltipContent>{tooltip}</TooltipContent>
      </TooltipProvider>
    );
  })
);
