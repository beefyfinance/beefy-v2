import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../helpers/format';
import { mooAmountToOracleAmount } from '../utils/ppfs';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { BoostEntity } from '../entities/boost';
import { VaultEntity, VaultGov } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenById, selectTokenPriceByTokenId } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { BeefyState } from '../../../redux-types';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';

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
  totalTvl: BIG_ZERO,
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
      addContractDataToState(state, sliceState, action.payload.data);
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        const state = action.payload.state;
        addContractDataToState(state, sliceState, action.payload.contractData);
      }
    );
  },
});

function addContractDataToState(
  state: BeefyState,
  sliceState: WritableDraft<TvlState>,
  contractData: FetchAllContractDataResult
) {
  // On standard vault contract data, recompute tvl and exclusions
  for (const vaultContractData of contractData.standardVaults) {
    const vault = selectVaultById(state, vaultContractData.id);
    const price = selectTokenPriceByTokenId(state, vault.oracleId);

    const vaultTvl = vaultContractData.balance.times(price);

    // save for vault
    sliceState.byVaultId[vault.id] = { tvl: vaultTvl };
  }

  for (const govVaultContractData of contractData.govVaults) {
    const totalStaked = govVaultContractData.totalSupply;

    const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;
    const price = selectTokenPriceByTokenId(state, vault.oracleId);

    let tvl = totalStaked.times(price);

    // handle gov vault TVL exclusion
    if (vault.excludedId) {
      const excludedTVL = sliceState.byVaultId[vault.excludedId]?.tvl;
      if (excludedTVL) {
        tvl = tvl.minus(excludedTVL);
      }
    }
    sliceState.byVaultId[vault.id] = { tvl: tvl };
  }

  // create an index of ppfs for boost tvl usage
  const ppfsPerVaultId: { [vaultId: VaultEntity['id']]: BigNumber } = {};
  for (const vault of contractData.standardVaults) {
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
  for (const boostContractData of contractData.boosts) {
    const boost = selectBoostById(state, boostContractData.id);
    const vault = selectVaultById(state, boost.vaultId);
    const oraclePrice = selectTokenPriceByTokenId(state, vault.oracleId);
    // find vault price per full share for the vault
    const ppfs = ppfsPerVaultId[vault.id];
    if (ppfs === undefined) {
      throw new Error(`Could not find ppfs for vault id ${vault.id}`);
    }
    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
    const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    const totalStaked = mooAmountToOracleAmount(
      mooToken,
      oracleToken,
      ppfs,
      boostContractData.totalSupply
    );
    const tvl = totalStaked.times(oraclePrice);

    // add data to state
    sliceState.byBoostId[boost.id] = { tvl, staked: totalStaked };
  }

  // recompute total tvl as a whole
  let totalTvl = BIG_ZERO;
  for (const vaultTvl of Object.values(sliceState.byVaultId)) {
    totalTvl = totalTvl.plus(vaultTvl.tvl);
  }
  sliceState.totalTvl = totalTvl;
}
