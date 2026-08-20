import type { Address } from 'viem';
import type { BaseUserData, Migrator } from '../migration-types';
import { type TokenErc20 } from '../../../entities/token';
type UserData = BaseUserData & {
    tokens: bigint;
    shares: bigint;
    morphoVault: Address;
    depositToken: TokenErc20;
};
declare const id = "morpho";
export declare const migrator: Migrator<typeof id, UserData>;
export {};
