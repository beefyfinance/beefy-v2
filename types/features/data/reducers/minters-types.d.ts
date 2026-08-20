import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain';
import type { MinterEntity } from '../entities/minter';
import type { VaultEntity } from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
export type MintersState = NormalizedEntity<MinterEntity> & {
    byChainId: {
        [chainId in ChainEntity['id']]?: MinterEntity['id'][];
    };
    byVaultId: {
        [vaultId: VaultEntity['id']]: MinterEntity['id'][];
    };
    reservesById: {
        [minterId: MinterEntity['id']]: BigNumber;
    };
    totalSupplyById: {
        [minterId: MinterEntity['id']]: BigNumber;
    };
};
