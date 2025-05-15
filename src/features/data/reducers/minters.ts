import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { entries } from '../../../helpers/object.ts';
import { fetchAllMinters, initiateMinterForm, reloadReserves } from '../actions/minters.ts';
import type { MinterConfig } from '../apis/config-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { MinterEntity } from '../entities/minter.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { MintersState } from './minters-types.ts';

export const initialMintersState: MintersState = {
  byId: {},
  allIds: [],
  byChainId: {},
  byVaultId: {},
  reservesById: {},
  totalSupplyById: {},
};

export const mintersSlice = createSlice({
  name: 'minters',
  initialState: initialMintersState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAllMinters.fulfilled, (sliceState, action) => {
      for (const [chainId, minters] of entries(action.payload.byChainId)) {
        if (minters) {
          for (const minter of minters) {
            addMinterToState(sliceState, chainId, minter);
          }
        }
      }
    });
    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      //Add Reserves to State
      sliceState.reservesById[action.payload.minterId] = action.payload.reserves;
      sliceState.totalSupplyById[action.payload.minterId] = action.payload.totalSupply;
    });
    builder.addCase(reloadReserves.fulfilled, (sliceState, action) => {
      sliceState.reservesById[action.payload.id] = action.payload.reserves;
      sliceState.totalSupplyById[action.payload.id] = action.payload.totalSupply;
    });
  },
});

function addMinterToState(
  sliceState: Draft<MintersState>,
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
  const chainState = getOrCreateMinterChainState(sliceState, chainId);
  chainState.push(minter.id);

  // Add to vault id index
  for (const vaultId of minter.vaultIds) {
    const vaultState = getOrCreateMinterVaultState(sliceState, vaultId);
    vaultState.push(minter.id);
  }
}

function getOrCreateMinterChainState(sliceState: Draft<MintersState>, chainId: ChainEntity['id']) {
  let chainState = sliceState.byChainId[chainId];
  if (chainState === undefined) {
    chainState = sliceState.byChainId[chainId] = [];
  }
  return chainState;
}

function getOrCreateMinterVaultState(sliceState: Draft<MintersState>, vaultId: VaultEntity['id']) {
  let vaultState = sliceState.byVaultId[vaultId];
  if (vaultState === undefined) {
    vaultState = sliceState.byVaultId[vaultId] = [];
  }
  return vaultState;
}
