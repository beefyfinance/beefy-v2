import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { mooAmountToOracleAmount } from '../utils/ppfs.ts';
import type { Draft } from 'immer';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import { isStandardVault, type VaultCowcentrated, type VaultEntity } from '../entities/vault.ts';
import { selectBoostById } from '../selectors/boosts.ts';
import { selectTokenByAddress, selectTokenPriceByAddress } from '../selectors/tokens.ts';
import { selectVaultById } from '../selectors/vaults.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import type { BeefyState } from '../../../redux-types.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number.ts';
import { selectActiveChainIds } from '../selectors/chains.ts';

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  totalTvl: BigNumber;
  byVaultId: {
    [vaultId: VaultEntity['id']]: {
      tvl: BigNumber;
      rawTvl: BigNumber;
    };
  };
  byBoostId: {
    [boostId: BoostPromoEntity['id']]: {
      staked: BigNumber;
      tvl: BigNumber;
    };
  };
  exclusions: {
    [vaultId: VaultEntity['id']]: VaultEntity['id'];
  };
  byChaindId: Partial<Record<ChainEntity['id'], BigNumber>>;
}

export const initialTvlState: TvlState = {
  totalTvl: BIG_ZERO,
  byVaultId: {},
  byBoostId: {},
  exclusions: {},
  byChaindId: {},
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
  sliceState: Draft<TvlState>,
  contractData: FetchAllContractDataResult
) {
  // On standard vault contract data, recompute tvl and exclusions
  for (const vaultContractData of contractData.standardVaults) {
    const vault = selectVaultById(state, vaultContractData.id);
    const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    const rawTvl = vaultContractData.balance.times(price);
    const tvl = rawTvl;

    sliceState.byVaultId[vault.id] = { tvl, rawTvl };
  }

  for (const govVaultContractData of contractData.govVaults) {
    const vault = selectVaultById(state, govVaultContractData.id);
    const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    const totalStaked = govVaultContractData.totalSupply;
    const rawTvl = totalStaked.times(price);
    let tvl = rawTvl;

    // exclude other tvls from counting towards this
    for (const excludedId of vault.excludedIds) {
      const excludedVault = selectVaultById(state, excludedId);
      if (excludedVault && excludedVault.status === 'active') {
        const excludedTVL = sliceState.byVaultId[excludedId]?.tvl;
        if (excludedTVL) {
          tvl = tvl.minus(excludedTVL);
        }
      }
    }

    sliceState.byVaultId[vault.id] = { tvl, rawTvl };
  }

  for (const govVaultMultiContractData of contractData.govVaultsMulti) {
    const vault = selectVaultById(state, govVaultMultiContractData.id);
    const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    const totalStaked = govVaultMultiContractData.totalSupply;
    const rawTvl = totalStaked.times(price);
    let tvl = rawTvl;

    // exclude other tvls from counting towards this e.g. bifi gov pool excludes bifi vault standard tvl / clm pool excludes clm vault
    for (const excludedId of vault.excludedIds) {
      const excludedVault = selectVaultById(state, excludedId);
      if (excludedVault && excludedVault.status === 'active') {
        const excludedTVL = sliceState.byVaultId[excludedId]?.tvl;
        if (excludedTVL) {
          tvl = tvl.minus(excludedTVL);
        }
      }
    }

    sliceState.byVaultId[vault.id] = { tvl, rawTvl };
  }

  for (const cowVaultContractData of contractData.cowVaults) {
    const vault = selectVaultById(state, cowVaultContractData.id) as VaultCowcentrated;
    const vaultTokens = vault.depositTokenAddresses.map(address =>
      selectTokenByAddress(state, vault.chainId, address)
    );
    const rawTvl = vaultTokens.reduce((acc, token, i) => {
      const price = selectTokenPriceByAddress(state, vault.chainId, token.address);
      return acc.plus(cowVaultContractData.balances[i].times(price));
    }, BIG_ZERO);
    let tvl = rawTvl;

    // exclude other tvls from counting towards this e.g. clm excludes clm pool and clm vault
    for (const excludedId of vault.excludedIds) {
      const excludedVault = selectVaultById(state, excludedId);
      if (excludedVault && excludedVault.status === 'active') {
        const excludedTVL = sliceState.byVaultId[excludedId]?.tvl;
        if (excludedTVL) {
          tvl = tvl.minus(excludedTVL);
        }
      }
    }

    for (const erc4626ContractData of contractData.erc4626Vaults) {
      const vault = selectVaultById(state, erc4626ContractData.id);
      const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
      const rawTvl = erc4626ContractData.balance.times(price);
      const tvl = rawTvl;

      sliceState.byVaultId[vault.id] = { tvl, rawTvl };
    }

    sliceState.byVaultId[vault.id] = { tvl, rawTvl };
  }

  // create an index of ppfs for boost tvl usage
  const ppfsPerVaultId: {
    [vaultId: VaultEntity['id']]: BigNumber;
  } = {};
  for (const vault of contractData.standardVaults) {
    ppfsPerVaultId[vault.id] = vault.pricePerFullShare;
  }
  for (const vault of contractData.erc4626Vaults) {
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
    const oraclePrice = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
    // find vault price per full share for the vault
    const ppfs = ppfsPerVaultId[vault.id];
    // Only CLM vaults need/have ppfs
    if (ppfs === undefined && isStandardVault(vault)) {
      throw new Error(`Could not find ppfs for vault id ${vault.id}`);
    }
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const mooToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
    const totalStaked = mooAmountToOracleAmount(
      mooToken,
      depositToken,
      ppfs || BIG_ONE,
      boostContractData.totalSupply
    );
    const tvl = totalStaked.times(oraclePrice);

    // add data to state
    sliceState.byBoostId[boost.id] = { tvl, staked: totalStaked };
  }

  const activeChainIds = selectActiveChainIds(state);
  const byChaindIdTotals: Draft<TvlState['byChaindId']> = {};
  let totalTvl = BIG_ZERO;
  for (const [vaultId, vaultTvl] of Object.entries(sliceState.byVaultId)) {
    const vault = selectVaultById(state, vaultId);

    byChaindIdTotals[vault.chainId] = (byChaindIdTotals[vault.chainId] || BIG_ZERO).plus(
      vaultTvl.tvl
    );

    // Only include active chains in total
    if (activeChainIds.includes(vault.chainId)) {
      totalTvl = totalTvl.plus(vaultTvl.tvl);
    }
  }
  sliceState.byChaindId = byChaindIdTotals;
  // recompute total tvl as a whole
  sliceState.totalTvl = totalTvl;
}
