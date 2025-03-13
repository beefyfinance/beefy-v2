import { createContext, useContext } from 'react';
import type { TooltipData } from './types.ts';

export const TooltipContext = createContext<TooltipData | null>(null);

export function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within a TooltipProvider');
  }
  return context;
}
