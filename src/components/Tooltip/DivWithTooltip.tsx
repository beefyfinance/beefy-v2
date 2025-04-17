import type { TooltipOptions } from './types.ts';
import { forwardRef, memo, type MouseEventHandler, type ReactNode } from 'react';
import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipContent } from './TooltipContent.tsx';
import { TooltipTrigger } from './TooltipTrigger.ts';

export type DivWithTooltipProps = TooltipOptions & {
  tooltip: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const DivWithTooltip = memo(
  forwardRef<HTMLDivElement, DivWithTooltipProps>(function DivWithTooltip(
    { children, tooltip, onClick, className, contentClassName, ...rest },
    ref
  ) {
    return (
      <TooltipProvider {...rest}>
        <TooltipTrigger.div onClick={onClick} className={className} ref={ref}>
          {children}
        </TooltipTrigger.div>
        <TooltipContent className={contentClassName}>{tooltip}</TooltipContent>
      </TooltipProvider>
    );
  })
);
