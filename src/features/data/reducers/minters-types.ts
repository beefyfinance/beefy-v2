import type BigNumber from 'bignumber.js';
import type { MinterEntity } from '../entities/minter.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

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
