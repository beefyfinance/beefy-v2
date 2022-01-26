import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import {
  fetchBoostAllowanceAction,
  fetchGovVaultPoolsAllowanceAction,
  fetchStandardVaultAllowanceAction,
} from '../actions/allowance';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';
import { accountHasChanged, walletHasDisconnected } from './wallet';

interface Allowance {
  allowance: BigNumber; // amount allowed
  spenderAddress: string;
}

/**
 * State containing user allowances state
 * Allowance being the amount allowed to be spent big a contract
 * for the currently connected user
 */
export interface AllowanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: Allowance;
      };
      byVaultId: {
        [vaultId: VaultEntity['id']]: Allowance;
      };
      byBoostId: {
        [boostId: BoostEntity['id']]: Allowance;
      };
    };
  };
}
export const initialAllowanceState: AllowanceState = { byChainId: {} };

export const allowanceSlice = createSlice({
  name: 'allowance',
  initialState: initialAllowanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // reset state on user disconnect or address change
    builder.addCase(accountHasChanged, sliceState => {
      sliceState.byChainId = {};
    });
    builder.addCase(walletHasDisconnected, sliceState => {
      sliceState.byChainId = {};
    });

    builder.addCase(fetchGovVaultPoolsAllowanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { byBoostId: {}, byTokenId: {}, byVaultId: {} };
      }

      for (const vaultAllowance of action.payload.data) {
        // only update data if necessary
        const stateForVault = sliceState.byChainId[chainId].byVaultId[vaultAllowance.vaultId];
        if (
          stateForVault === undefined ||
          !stateForVault.allowance.isEqualTo(vaultAllowance.allowance) ||
          stateForVault.spenderAddress !== vaultAllowance.spenderAddress
        ) {
          sliceState.byChainId[chainId].byVaultId[vaultAllowance.vaultId] = {
            allowance: vaultAllowance.allowance,
            spenderAddress: vaultAllowance.spenderAddress,
          };
        }
      }
    });

    builder.addCase(fetchStandardVaultAllowanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { byBoostId: {}, byTokenId: {}, byVaultId: {} };
      }

      for (const vaultAllowance of action.payload.data) {
        // only update data if necessary
        const stateForVault = sliceState.byChainId[chainId].byVaultId[vaultAllowance.vaultId];
        if (
          stateForVault === undefined ||
          !stateForVault.allowance.isEqualTo(vaultAllowance.allowance) ||
          stateForVault.spenderAddress !== vaultAllowance.spenderAddress
        ) {
          sliceState.byChainId[chainId].byVaultId[vaultAllowance.vaultId] = {
            allowance: vaultAllowance.allowance,
            spenderAddress: vaultAllowance.spenderAddress,
          };
        }
      }
    });

    builder.addCase(fetchBoostAllowanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;

      if (sliceState.byChainId[chainId] === undefined) {
        sliceState.byChainId[chainId] = { byBoostId: {}, byTokenId: {}, byVaultId: {} };
      }

      for (const boostAllowance of action.payload.data) {
        // only update data if necessary
        const stateForBoost = sliceState.byChainId[chainId].byBoostId[boostAllowance.boostId];
        if (
          stateForBoost === undefined ||
          !stateForBoost.allowance.isEqualTo(boostAllowance.allowance) ||
          stateForBoost.spenderAddress !== boostAllowance.spenderAddress
        ) {
          sliceState.byChainId[chainId].byBoostId[boostAllowance.boostId] = {
            allowance: boostAllowance.allowance,
            spenderAddress: boostAllowance.spenderAddress,
          };
        }
      }
    });
  },
});
