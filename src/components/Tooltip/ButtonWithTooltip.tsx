import type { TooltipOptions } from './types.ts';
import { forwardRef, memo, type MouseEventHandler, type ReactNode } from 'react';
import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipContent } from './TooltipContent.tsx';
import { TooltipTrigger } from './TooltipTrigger.ts';

export type ButtonWithTooltipProps = TooltipOptions & {
  tooltip: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export const ButtonWithTooltip = memo(
  forwardRef<HTMLButtonElement, ButtonWithTooltipProps>(function DivWithTooltip(
    { children, tooltip, onClick, className, ...rest },
    ref
  ) {
    return (
      <TooltipProvider {...rest}>
        <TooltipTrigger.button onClick={onClick} className={className} ref={ref}>
          {children}
        </TooltipTrigger.button>
        <TooltipContent>{tooltip}</TooltipContent>
      </TooltipProvider>
    );
  })
);
