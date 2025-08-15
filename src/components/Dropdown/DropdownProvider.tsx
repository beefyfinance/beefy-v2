import { memo, type ReactNode, useCallback, useMemo, useRef, useEffect } from 'react';
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
  hoverCloseDelay = 150,
  ...rest
}: DropdownProviderProps) {
  const value = useDropdown(rest);
  const closeTimeoutRef = useRef<NodeJS.Timeout>();

  // Create custom hover handlers that only trigger on the provider element
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (openOnHover && !disabled && e.currentTarget === e.target) {
        // Clear any pending close timeout
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = undefined;
        }
        value.setOpen(true);
      }
    },
    [openOnHover, disabled, value]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (openOnHover && !disabled && e.currentTarget === e.target) {
        // Add delay before closing to allow moving to dropdown content
        // This gives users time to move their mouse to the dropdown content
        closeTimeoutRef.current = setTimeout(() => {
          value.setOpen(false);
        }, hoverCloseDelay);
      }
    },
    [openOnHover, disabled, hoverCloseDelay, value]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

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
      // Add content hover handlers to prevent closing when hovering over dropdown content
      contentHoverHandlers:
        openOnHover ?
          {
            onMouseEnter: () => {
              // Clear any pending close timeout when hovering over content
              // This prevents the dropdown from closing when moving from trigger to content
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = undefined;
              }
            },
            onMouseLeave: () => {
              // Close dropdown when leaving content area
              // This ensures the dropdown closes when the user is no longer hovering over any part
              value.setOpen(false);
            },
          }
        : undefined,
    };
  }, [value, openOnHover, handleMouseEnter, handleMouseLeave]);

  return <DropdownContext.Provider value={extendedValue}>{children}</DropdownContext.Provider>;
});
