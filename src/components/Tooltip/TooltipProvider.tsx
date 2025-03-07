import { memo, type ReactNode } from 'react';
import type { TooltipOptions } from './types.ts';
import { useTooltip } from './useTooltip.ts';
import { TooltipContext } from './useTooltipContext.ts';

export type TooltipProviderProps = TooltipOptions & {
  children: ReactNode;
};

export const TooltipProvider = memo(function TooltipProvider({
  children,
  ...rest
}: TooltipProviderProps) {
  const value = useTooltip(rest);
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
});
