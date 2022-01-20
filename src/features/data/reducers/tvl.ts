import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  fetchGovVaultContractDataAction,
  fetchStandardVaultContractDataAction,
} from '../actions/vault-contract';
import { BoostEntity } from '../entities/boost';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectTokenPriceByTokenId } from '../selectors/token-prices';
import { selectTokenById } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';

// todo: entity WIP

interface BoostTvl {
  // TODO: how are these different?
  stacked: number;
  tvl: number;
}

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  totalTvl: BigNumber;
  byVaultId: {
    [vaultId: VaultEntity['id']]: BigNumber;
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: BoostTvl;
  };
  exclusions: {
    [vaultId: VaultEntity['id']]: VaultEntity['id'];
  };
}
export const initialTvlState: TvlState = {
  totalTvl: new BigNumber(0),
  byVaultId: {},
  byBoostId: {},
  exclusions: {},
};

export const tvlSlice = createSlice({
  name: 'tvl',
  initialState: initialTvlState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchGovVaultContractDataAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const rawTvlByVaultId: { [vaultId: VaultEntity['id']]: BigNumber } = {};
      for (const govVaultContractData of action.payload.data) {
        const totalStaked = govVaultContractData.totalStaked;

        const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;
        const oracleToken = selectTokenById(state, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken.id);

        const vaultRawTvl = totalStaked
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));
        rawTvlByVaultId[vault.id] = vaultRawTvl;
      }

      // handle exclusions
      for (const govVaultContractData of action.payload.data) {
        // now remove excluded vault tvl from vault tvl
        const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;
        const excludedVault = selectVaultById(state, vault.excludedId);
        if (rawTvlByVaultId[excludedVault.id] !== undefined) {
          rawTvlByVaultId[vault.id] = rawTvlByVaultId[vault.id].minus(
            rawTvlByVaultId[excludedVault.id]
          );
        }
      }

      let totalTvl = sliceState.totalTvl;
      for (const [vaultId, vaultTvl] of Object.entries(rawTvlByVaultId)) {
        // add vault tvl to total tvl state
        totalTvl = totalTvl.plus(vaultTvl);
        // add vault tvl to state
        sliceState.byVaultId[vaultId] = vaultTvl;
      }
      sliceState.totalTvl = totalTvl;
    });

    builder.addCase(fetchStandardVaultContractDataAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const rawTvlByVaultId: { [vaultId: VaultEntity['id']]: BigNumber } = {};
      for (const vaultContractData of action.payload.data) {
        const vault = selectVaultById(state, vaultContractData.id) as VaultStandard;
        const oracleToken = selectTokenById(state, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken.id);

        const vaultRawTvl = vaultContractData.balance
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));
        rawTvlByVaultId[vault.id] = vaultRawTvl;
      }

      let totalTvl = sliceState.totalTvl;
      for (const [vaultId, vaultTvl] of Object.entries(rawTvlByVaultId)) {
        // add vault tvl to total tvl state
        totalTvl = totalTvl.plus(vaultTvl);
        // add vault tvl to state
        sliceState.byVaultId[vaultId] = vaultTvl;
      }
      sliceState.totalTvl = totalTvl;
    });
  },
});
