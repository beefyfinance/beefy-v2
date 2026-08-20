import type { CuratorEntity } from '../entities/curator';
import type { NormalizedEntity } from '../utils/normalized-entity';
/**
 * State containing Curator infos
 */
export type CuratorsState = NormalizedEntity<CuratorEntity>;
export declare const initialCuratorsState: CuratorsState;
export declare const curatorsSlice: import("@reduxjs/toolkit").Slice<CuratorsState, {}, "curators", "curators", import("@reduxjs/toolkit").SliceSelectors<CuratorsState>>;
