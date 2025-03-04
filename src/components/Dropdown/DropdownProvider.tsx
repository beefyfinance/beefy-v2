import { memo, type ReactNode } from 'react';
import type { DropdownOptions } from './types.ts';
import { useDropdown } from './useDropdown.ts';
import { DropdownContext } from './useDropdownContext.ts';

export type DropdownProviderProps = DropdownOptions & {
  children: ReactNode;
};

export const DropdownProvider = memo(function DropdownProvider({
  children,
  ...rest
}: DropdownProviderProps) {
  const value = useDropdown(rest);
  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>;
});
