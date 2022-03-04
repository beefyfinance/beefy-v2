import { createSlice } from '@reduxjs/toolkit';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchPartnersConfig } from '../actions/partners';
import { MoonpotConfig } from '../apis/config';
import { LaCucinaConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import { PartnerEntity } from '../entities/partner';
import { VaultEntity } from '../entities/vault';

/**
 * State containing Vault infos
 */
export type PartnersState = {
  byId: {
    [partnerId: PartnerEntity['id']]: PartnerEntity;
  };
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
      [vaultId: VaultEntity['id']]: LaCucinaConfig;
    };
  };
};
export const initialPartnersState: PartnersState = {
  byId: {},
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
      for (const laCucinaConfig of action.payload.LaCucina) {
        const vaultId = laCucinaConfig.id;
        if (!sliceState.lacucina.byVaultId[vaultId]) {
          sliceState.lacucina.byVaultId[vaultId] = laCucinaConfig;
        }
      }
    });

    builder.addCase(fetchAllBoosts.fulfilled, (sliceState, action) => {
      for (const boosts of Object.values(action.payload)) {
        for (const boost of boosts) {
          for (const partner of boost.partners || []) {
            const id = partner.website;
            if (sliceState.byId[id] === undefined) {
              sliceState.byId[id] = { id, ...partner };
            }
          }
        }
      }
    });
  },
});
