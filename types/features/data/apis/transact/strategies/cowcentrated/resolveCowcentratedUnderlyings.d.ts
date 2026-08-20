import type { AnyComposableStrategy, IComposableStrategy } from '../IStrategy';
import { type ICowcentratedVaultType } from '../../vaults/IVaultType';
/**
 * Split a composer's underlyings into the `cowcentrated` primary and optional
 * `cowcentrated-dual` sibling, and expose the shared cowcentrated vault type.
 */
export declare function resolveCowcentratedUnderlyings(underlyings: AnyComposableStrategy[]): {
    primary: IComposableStrategy<'cowcentrated'>;
    dual: IComposableStrategy<'cowcentrated-dual'> | undefined;
    vaultType: ICowcentratedVaultType;
};
