import { useBreakpoints } from '../../../../../../hooks/useBreakpoints.ts';

/**
 * Fixed height for the vault list: 3 rows visible, the rest reachable by scrolling. Holding it
 * constant is what stops the panel resizing as you step between chains.
 */
export function useVaultListHeight(visibleRows: number = 3) {
  const breakpoints = useBreakpoints();
  const rowHeight =
    breakpoints.lg ? 100
    : breakpoints.md ? 171
    : breakpoints.sm ? 242
    : 324;
  const gap = 2;
  return visibleRows * rowHeight + (visibleRows - 1) * gap;
}
