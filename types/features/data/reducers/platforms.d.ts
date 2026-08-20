import type { PlatformEntity } from '../entities/platform';
import type { NormalizedEntity } from '../utils/normalized-entity';
/**
 * State containing Vault infos
 */
export type PlatformsState = NormalizedEntity<PlatformEntity> & {
    activeIds: PlatformEntity['id'][];
    byType: Partial<Record<NonNullable<PlatformEntity['type']>, PlatformEntity['id'][]>>;
};
export declare const initialPlatformsState: PlatformsState;
export declare const platformsSlice: import("@reduxjs/toolkit").Slice<PlatformsState, {}, "platforms", "platforms", import("@reduxjs/toolkit").SliceSelectors<PlatformsState>>;
