import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { BoostEntity } from '../entities/boost';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenById, selectTokenPriceByTokenId } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  totalTvl: BigNumber;
  byVaultId: {
    [vaultId: VaultEntity['id']]: {
      tvl: BigNumber;
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
    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;

      // On standard vault contract data, recompute tvl and exclusions
      let totalTvl = sliceState.totalTvl;
      for (const vaultContractData of action.payload.data.standardVaults) {
        const vault = selectVaultById(state, vaultContractData.id) as VaultStandard;
        const oracleToken = selectTokenById(state, action.payload.chainId, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken.id);

        const vaultTvl = vaultContractData.balance
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));

        // add vault tvl to total tvl state
        totalTvl = totalTvl.plus(vaultTvl);

        // save for vault
        sliceState.byVaultId[vault.id] = {
          tvl: vaultTvl,
        };
      }

      const rawTvlByVaultId: { [vaultId: VaultEntity['id']]: BigNumber } = {};
      for (const govVaultContractData of action.payload.data.govVaults) {
        const totalStaked = govVaultContractData.totalStaked;

        const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;
        const oracleToken = selectTokenById(state, action.payload.chainId, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken.id);

        const vaultRawTvl = totalStaked
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));
        rawTvlByVaultId[vault.id] = vaultRawTvl;
      }

      // handle exclusions
      for (const govVaultContractData of action.payload.data.govVaults) {
        // now remove excluded vault tvl from vault tvl
        const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;

        if (vault.excludedId) {
          const excludedVault = selectVaultById(state, vault.excludedId);
          if (rawTvlByVaultId[excludedVault.id] !== undefined) {
            rawTvlByVaultId[vault.id] = rawTvlByVaultId[vault.id].minus(
              rawTvlByVaultId[excludedVault.id]
            );
          }
        }
      }

      for (const [vaultId, vaultTvl] of Object.entries(rawTvlByVaultId)) {
        // add vault tvl to total tvl state
        totalTvl = totalTvl.plus(vaultTvl);
        // add vault tvl to state
        sliceState.byVaultId[vaultId] = { tvl: vaultTvl };
      }
      sliceState.totalTvl = totalTvl;

      // create an index of ppfs for boost tvl usage
      const ppfsPerVaultId: { [vaultId: VaultEntity['id']]: BigNumber } = {};
      for (const vault of action.payload.data.standardVaults) {
        ppfsPerVaultId[vault.id] = vault.pricePerFullShare;
      }

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
      for (const boostContractData of action.payload.data.boosts) {
        const boost = selectBoostById(state, boostContractData.id);
        const vault = selectVaultById(state, boost.vaultId);

        const token = selectTokenById(state, action.payload.chainId, vault.oracleId);
        const tokenPrice = selectTokenPriceByTokenId(state, token.id);
        // find vault price per full share for the vault
        const ppfs = ppfsPerVaultId[vault.id];
        if (ppfs === undefined) {
          throw new Error(`Could not find ppfs for vault id ${vault.id}`);
        }

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
