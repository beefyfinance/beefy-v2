import type { TokenLpBreakdown } from '../../../data/entities/token';
import type { VaultEntity } from '../../../data/entities/vault';
import type { CalculatedBreakdownData } from './types';
export declare const chartColors: string[];
export declare function useCalculatedBreakdown(vault: VaultEntity, breakdown: TokenLpBreakdown): CalculatedBreakdownData;
