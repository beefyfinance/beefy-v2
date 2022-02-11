import { createSlice } from '@reduxjs/toolkit';
import { fetchPartnersConfig } from '../actions/partners';
import { MoonpotConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';

/**
 * State containing Vault infos
 */
export type PartnersState = {
  moonpot: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: MoonpotConfig;
    };
  };
  insurace: {
    byChainId: {
      [chainId: ChainEntity['id']]: boolean;
    };
  };
  qidao: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: boolean;
    };
  };
  lacucina: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: boolean;
    };
  };
};
export const initialPartnersState: PartnersState = {
  moonpot: {
    byVaultId: {},
  },
  insurace: {
    byChainId: {},
  },
  qidao: {
    byVaultId: {},
  },
  lacucina: {
    byVaultId: {},
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
      for (const moonpotConfig of action.payload.Moonpot) {
        const vaultId = moonpotConfig.id;
        if (!sliceState.moonpot.byVaultId[vaultId]) {
          sliceState.moonpot.byVaultId[vaultId] = moonpotConfig;
        }
      }
      for (const chainId of action.payload.Insurace) {
        if (!sliceState.insurace.byChainId[chainId]) {
          sliceState.insurace.byChainId[chainId] = true;
        }
      }
      for (const vaultId of action.payload.QiDao) {
        if (!sliceState.qidao.byVaultId[vaultId]) {
          sliceState.qidao.byVaultId[vaultId] = true;
        }
      }
      for (const vaultId of action.payload.LaCucina) {
        if (!sliceState.lacucina.byVaultId[vaultId]) {
          sliceState.lacucina.byVaultId[vaultId] = true;
        }
      }
    });
  },
});
