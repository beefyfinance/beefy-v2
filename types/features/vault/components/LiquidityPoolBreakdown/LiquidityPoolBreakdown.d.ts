import { type VaultEntity } from '../../../data/entities/vault';
export type LiquidityPoolBreakdownProps = {
    vaultId: VaultEntity['id'];
};
export declare const LiquidityPoolBreakdown: import("react").NamedExoticComponent<LiquidityPoolBreakdownProps>;
type LiquidityPoolBreakdownLoaderProps = {
    vaultId: VaultEntity['id'];
};
export declare const LiquidityPoolBreakdownLoader: import("react").NamedExoticComponent<LiquidityPoolBreakdownLoaderProps>;
export {};
