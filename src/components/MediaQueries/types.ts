import type { BreakpointToken } from '@repo/styles/tokens';
import type { ReactNode } from 'react';

export type Breakpoint = 'xs' | BreakpointToken;

type BreakpointUp = `${Breakpoint}Up`;

/** inclusive */
type BreakpointDown = `${Breakpoint}Down`;

type BreakpointProp = { [K in BreakpointUp]?: boolean } & { [K in BreakpointDown]?: boolean };

export type BreakpointMatches = Record<Breakpoint, boolean>;

export type FromOrToProp =
  | {
      /** inclusive */
      from: Breakpoint;
    }
  | {
      /** inclusive */
      to: Breakpoint;
    };

export type VisibleProps = {
  children: ReactNode;
  else?: ReactNode;
} & FromOrToProp;

export type HiddenProps = {
  children: ReactNode;
  else?: ReactNode;
} & BreakpointProp;
