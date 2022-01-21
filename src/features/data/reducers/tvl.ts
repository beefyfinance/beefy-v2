import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchBoostContractDataAction } from '../actions/boost-contract';
import {
  fetchGovVaultContractDataAction,
  fetchStandardVaultContractDataAction,
} from '../actions/vault-contract';
import { BoostEntity } from '../entities/boost';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenPriceByTokenId } from '../selectors/token-prices';
import { selectTokenById } from '../selectors/tokens';
import { selectVaultPricePerFullShare } from '../selectors/tvl';
import { selectVaultById } from '../selectors/vaults';

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  totalTvl: BigNumber;
  byVaultId: {
    [vaultId: VaultEntity['id']]: {
      tvl: BigNumber;

      // TODO: this doesn't make sense for gov vaults
      pricePerFullShare: BigNumber;
    };
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: {
      staked: BigNumber;
      tvl: BigNumber;
    };
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
    /**
     * On gov vault contract data, recompute tvl and exclusions
     */
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
        sliceState.byVaultId[vaultId] = { tvl: vaultTvl, pricePerFullShare: new BigNumber(1) };
      }
      sliceState.totalTvl = totalTvl;
    });

    /**
     * On standard vault contract data, recompute tvl and exclusions
     */
    builder.addCase(fetchStandardVaultContractDataAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;

      let totalTvl = sliceState.totalTvl;
      for (const vaultContractData of action.payload.data) {
        const vault = selectVaultById(state, vaultContractData.id) as VaultStandard;
        const oracleToken = selectTokenById(state, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken.id);

        const vaultTvl = vaultContractData.balance
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));

        // add vault tvl to total tvl state
        totalTvl = totalTvl.plus(vaultTvl);

        // save for vault
        sliceState.byVaultId[vault.id] = {
          tvl: vaultTvl,
          pricePerFullShare: vaultContractData.pricePerFullShare,
        };
      }
      sliceState.totalTvl = totalTvl;
    });

    /**
     * Boosts always have an associated vault.
     * When computing the apr for a vault + tvl for boost we need to use both vault data and boost data
     * 2 tokens participate in this, one is the token being
     * staked in the vault and the second one is the boost reward token
     * For everything related to totalStaked/tvl we need to work with what's deposited, so the vault's token
     * When talking about apr, we need the totalStaked amount + data from the reward token,
     * since the ratio between the two will give us how much we are earning
     *
     * So let's take as an example
     * if we want to find the boost's tvl to see how much is deposited there
     * since we are talking about tvl we want to know how much has been deposited in that boost
     * so we'd need to know how much is deposited, that would be totalStaked
     * that would give us the amount deposited in the boost
     * however, those can be mooTokens
     * if we have mooTokens, we need to multiply times ppfs to get the amount of the underlying token
     * now that we have the amount of the underlying token
     * we can multiply it times the price and we get the amount  in usd
     */
    builder.addCase(fetchBoostContractDataAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;

      for (const boostContractData of action.payload.data) {
        const boost = selectBoostById(state, boostContractData.id);
        const vault = selectVaultById(state, boost.vaultId);

        const token = selectTokenById(state, vault.oracleId);
        const tokenPrice = selectTokenPriceByTokenId(state, token.id);
        const ppfs = selectVaultPricePerFullShare(state, vault.id);

        const totalStaked = boostContractData.totalStaked.times(ppfs).dividedBy(token.decimals);
        const staked = totalStaked.dividedBy(token.decimals);
        const tvl = totalStaked.times(tokenPrice).dividedBy(token.decimals);

        // add data to state
        sliceState.totalTvl = sliceState.totalTvl.plus(tvl);
        sliceState.byBoostId[boost.id] = { tvl, staked };
      }
    });
  },
});
