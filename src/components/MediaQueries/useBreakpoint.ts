import { useBreakpoints } from './useBreakpoints.ts';
import { useMemo } from 'react';
import type { Breakpoint, BreakpointMatches, FromOrToProp } from './types.ts';

export function useBreakpoint(opts: FromOrToProp) {
  const breakpoints = useBreakpoints();
  const { mode, breakpoint } = getModeBreakpoint(opts);
  return useMemo(() => {
    switch (mode) {
      case 'from':
        return isFrom(breakpoint, breakpoints);
      case 'to':
        return isUpTo(breakpoint, breakpoints);
    }
  }, [breakpoints, mode, breakpoint]);
}

function getModeBreakpoint(opts: FromOrToProp) {
  if ('from' in opts && opts.from) {
    return { mode: 'from', breakpoint: opts.from } as const;
  } else if ('to' in opts && opts.to) {
    return { mode: 'to', breakpoint: opts.to } as const;
  } else {
    throw new Error('up or down prop is required');
  }
}

export const breakpointKeys = ['xs', 'sm', 'md', 'lg', 'xl'] as const satisfies Breakpoint[];

/**
 * inclusive
 * isUpTo(xs) returns true when xs: true and sm: false
 * isUpTo(sm) return true when xs: true or sm: true, and md: false
 * */
function isUpTo(breakpoint: Breakpoint, breakpoints: BreakpointMatches) {
  const index = breakpointKeys.indexOf(breakpoint);
  if (index < breakpointKeys.length - 1) {
    const nextBreakpoint = breakpointKeys[index + 1];
    if (breakpoints[nextBreakpoint]) {
      return false;
    }
  }

  for (let i = index; i >= 0; --i) {
    if (breakpoints[breakpointKeys[i]]) {
      return true;
    }
  }

  return false;
}

function isFrom(breakpoint: Breakpoint, breakpoints: BreakpointMatches) {
  return breakpoints[breakpoint];
}
