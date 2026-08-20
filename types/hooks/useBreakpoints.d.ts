import type { BreakpointMatches } from '../components/MediaQueries/types';
import { type BreakpointToken } from '@repo/styles/tokens';
export declare const defaultBreakpointMatches: BreakpointMatches;
export declare const BreakpointContext: import("react").Context<BreakpointMatches>;
export declare const getQueries: (...props: never[]) => Record<BreakpointToken, string>;
export declare const useBreakpoints: () => BreakpointMatches;
