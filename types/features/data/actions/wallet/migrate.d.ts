import type { MigratorUnstakeProps } from '../../apis/migration/migration-types';
import { type Hash } from 'viem';
import type { VaultEntity } from '../../entities/vault';
import type BigNumber from 'bignumber.js';
export declare const migrateUnstake: (unstakeCall: (args: MigratorUnstakeProps) => Promise<Hash>, vault: VaultEntity, amount: BigNumber, migrationId: string) => import("../../store/types").BeefyThunk;
