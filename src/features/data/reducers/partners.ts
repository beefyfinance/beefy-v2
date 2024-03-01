import { createSlice } from '@reduxjs/toolkit';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import { fetchPartnersConfig } from '../actions/partners';

/**
 * State containing Vault infos
 */
export type PartnersState = {
  openCover: {
    byChainId: {
      [chainId in ChainEntity['id']]?: boolean;
    };
  };
  qidao: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: boolean;
    };
  };
  nexus: {
    byChainId: {
      [chainId in ChainEntity['id']]?: boolean;
    };
  };
};
export const initialPartnersState: PartnersState = {
  openCover: {
    byChainId: {},
  },
  qidao: {
    byVaultId: {},
  },
  nexus: {
    byChainId: {},
  },
};

export const partnersSlice = createSlice({
  name: 'partners',
  initialState: initialPartnersState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchPartnersConfig.fulfilled, (sliceState, action) => {
      for (const chainId of action.payload.OpenCover) {
        if (!sliceState.openCover.byChainId[chainId]) {
          sliceState.openCover.byChainId[chainId] = true;
        }
      }
      for (const vaultId of action.payload.QiDao) {
        if (!sliceState.qidao.byVaultId[vaultId]) {
          sliceState.qidao.byVaultId[vaultId] = true;
        }
      }
      for (const chainId of action.payload.Nexus) {
        if (!sliceState.nexus.byChainId[chainId]) {
          sliceState.nexus.byChainId[chainId] = true;
        }
      }
    });
  },
});
