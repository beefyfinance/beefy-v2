import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchGovVaultContractDataAction } from '../actions/vault-contract';
import { BoostEntity } from '../entities/boost';
import { TokenEntity } from '../entities/token';
import { VaultEntity, VaultGov } from '../entities/vault';
import { selectTokenPriceByTokenId } from '../selectors/token-prices';
import { selectTokenById } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';

// todo: entity WIP
interface VaultTvl {
  token: TokenEntity['id'];
  // no need for big numbers here
  amount: number;
}

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
    [vaultId: VaultEntity['id']]: VaultTvl;
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: BoostTvl;
  };
  exclusions: {
    [vaultId: VaultEntity['id']]: VaultEntity['id'];
  };
}
const initialState: TvlState = {
  totalTvl: new BigNumber(0),
  byVaultId: {},
  byBoostId: {},
  exclusions: {},
};

export const tvlSlice = createSlice({
  name: 'tvl',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchGovVaultContractDataAction.fulfilled, (state, action) => {
      for (const govVaultContractData of action.payload.data) {
        const totalStaked = govVaultContractData.totalStaked;

        const vault = selectVaultById(state, govVaultContractData.id) as VaultGov;
        const oracleToken = selectTokenById(state, vault.oracleId);
        const price = selectTokenPriceByTokenId(state, oracleToken);

        let vaultTvl = totalStaked
          .times(price)
          .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));

        // now remove excluded vault tvl from vault tvl
        const excludedVault = selectVaultById(state, vault.excludedId);
        vaultTvl = vaultTvl.minus();
        const S = pools[item.id].excluded;
        if (S && pools[S]) {
          tvl = tvl.minus(pools[S].tvl);
        }
      }
    });
  },
});

function getVaultRawTvl(state: BeefyState, vaultId: VaultEntity['id']) {
  const vault = selectVaultById(state, vaultId);
  const oracleToken = selectTokenById(state, vault.oracleId);
  const price = selectTokenPriceByTokenId(state, oracleToken.id);
  return totalStaked
    .times(price)
    .dividedBy(new BigNumber(10).exponentiatedBy(oracleToken.decimals));
}
