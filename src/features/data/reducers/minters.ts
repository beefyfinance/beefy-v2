import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';
import { MinterEntity } from '../entities/minter';
import { fetchAllMinters, initiateMinterForm, reloadReserves } from '../actions/minters';
import { MinterConfig } from '../apis/config-types';
import BigNumber from 'bignumber.js';

export type MintersState = NormalizedEntity<MinterEntity> & {
  byChainId: {
    [chainId: ChainEntity['id']]: MinterEntity['id'][];
  };
  byVaultId: {
    [vaultId: VaultEntity['id']]: MinterEntity['id'][];
  };
  reservesById: {
    [minterId: MinterEntity['id']]: BigNumber;
  };
};

export const initialMintersState: MintersState = {
  byId: {},
  allIds: [],
  byChainId: {},
  byVaultId: {},
  reservesById: {},
};

export const mintersSlice = createSlice({
  name: 'minters',
  initialState: initialMintersState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAllMinters.fulfilled, (sliceState, action) => {
      for (const [chainId, minters] of Object.entries(action.payload.byChainId)) {
        for (const minter of minters) {
          addMinterToState(sliceState, chainId, minter);
        }
      }
    });
    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      //Add Reserves to State
      sliceState.reservesById[action.payload.minterId] = action.payload.reserves;
    });
    builder.addCase(reloadReserves.fulfilled, (sliceState, action) => {
      sliceState.reservesById[action.payload.reserves.id] = action.payload.reserves.reserves;
    });
  },
});

function addMinterToState(
  sliceState: WritableDraft<MintersState>,
  chainId: ChainEntity['id'],
  apiMinter: MinterConfig
) {
  if (apiMinter.id in sliceState.byId) {
    return;
  }

  const minter: MinterEntity = {
    ...apiMinter,
    chainId: chainId,
  };

  // Add entity
  sliceState.byId[minter.id] = minter;
  sliceState.allIds.push(minter.id);

  // Add to chain id index
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = [];
  }
  sliceState.byChainId[chainId].push(minter.id);

  // Add to vault id index
  for (const vaultId of minter.vaultIds) {
    if (sliceState.byVaultId[vaultId] === undefined) {
      sliceState.byVaultId[vaultId] = [];
    }
    sliceState.byVaultId[vaultId].push(minter.id);
  }
}
