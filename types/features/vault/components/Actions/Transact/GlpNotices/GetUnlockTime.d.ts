import type { GlpLikeConfig, UnlockTimeResult } from './types';
import type { ChainEntity } from '../../../../../data/entities/chain';
export declare function getUnlockTime(depositTokenAddress: string, userAddress: string | undefined, chain: ChainEntity, config: GlpLikeConfig): Promise<UnlockTimeResult>;
