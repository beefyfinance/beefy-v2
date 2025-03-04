import { createContext, useContext } from 'react';
import type { DropdownData } from './types.ts';

export const DropdownContext = createContext<DropdownData | null>(null);

export function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdownContext must be used within a DropdownProvider');
  }
  return context;
}
