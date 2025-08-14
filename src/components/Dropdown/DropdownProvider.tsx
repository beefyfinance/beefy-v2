import { memo, type ReactNode, useCallback, useMemo } from 'react';
import type { DropdownOptions } from './types.ts';
import { useDropdown } from './useDropdown.ts';
import { DropdownContext } from './useDropdownContext.ts';

export type DropdownProviderProps = DropdownOptions & {
  children: ReactNode;
};

export const DropdownProvider = memo(function DropdownProvider({
  children,
  openOnHover = false,
  disabled = false,
  ...rest
}: DropdownProviderProps) {
  const value = useDropdown(rest);

  // Create custom hover handlers that only trigger on the provider element
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (openOnHover && !disabled && e.currentTarget === e.target) {
        value.setOpen(true);
      }
    },
    [openOnHover, disabled, value]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (openOnHover && !disabled && e.currentTarget === e.target) {
        value.setOpen(false);
      }
    },
    [openOnHover, disabled, value]
  );

  // Extend the value with custom hover handlers
  const extendedValue = useMemo(() => {
    return {
      ...value,
      hoverHandlers:
        openOnHover ?
          {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
          }
        : undefined,
    };
  }, [value, openOnHover, handleMouseEnter, handleMouseLeave]);

  return <DropdownContext.Provider value={extendedValue}>{children}</DropdownContext.Provider>;
});
