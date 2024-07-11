import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import type { BeefyState } from '../../../../redux-types';
import {
  fetchAllBalanceAction,
  type FetchAllBalanceFulfilledPayload,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../../actions/balance';
import { initiateBoostForm } from '../../actions/boosts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens';
import type {
  BoostBalance,
  GovVaultReward,
  GovVaultV2Balance,
  TokenBalance,
} from '../../apis/balance/balance-types';
import type { BoostEntity } from '../../entities/boost';
import type { ChainEntity } from '../../entities/chain';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import { selectBoostById } from '../../selectors/boosts';
import { selectVaultById } from '../../selectors/vaults';
import { initiateMinterForm } from '../../actions/minters';
import { selectMinterById } from '../../selectors/minters';
import { BIG_ZERO } from '../../../../helpers/big-number';

/**
 * State containing user balances state
 */
export interface BalanceState {
  // we want to keep everything by address to be able to display the right
  // data even when the user quickly changes account
  byAddress: {
    [address: string]: {
      // quick access to all deposited vaults for this address
      // this can include gov, standard, or a boost's target vault
      depositedVaultIds: VaultEntity['id'][];

      /**
       * all balances below represent token amounts
       */
      tokenAmount: {
        /**
         * Token balance, used to know standard vault balance with earnToken (mooXyzToken)
         * and oracle balance, to display how much the user can put in a vault or boost
         */
        byChainId: {
          [chainId in ChainEntity['id']]?: {
            byTokenAddress: {
              [tokenAddress: TokenEntity['address']]: {
                balance: BigNumber;
              };
            };
          };
        };

        /**
         * The boost balance to know how much we withdraw from the boost
         * and how much rewards we can claim
         */
        byBoostId: {
          [boostId: BoostEntity['id']]: {
            balance: BigNumber;
            rewards: BigNumber;
          };
        };

        /**
         * The gov vault token balance and pending rewards
         */
        byGovVaultId: {
          [vaultId: VaultEntity['id']]: {
            balance: BigNumber;
            rewards: GovVaultReward[];
          };
        };
      };
    };
  };
}

export const initialBalanceState: BalanceState = {
  byAddress: {},
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState: initialBalanceState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllBalanceAction.fulfilled, (sliceState, action) => {
      addBalancesToState(sliceState, action.payload);
    });

    builder.addCase(fetchBalanceAction.fulfilled, (sliceState, action) => {
      addBalancesToState(sliceState, action.payload);
    });

    builder.addCase(initiateBoostForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      if (!action.payload.walletAddress) {
        return;
      }
      const boost = selectBoostById(action.payload.state, action.payload.boostId);
      const vault = selectVaultById(action.payload.state, boost.vaultId);
      const walletAddress = action.payload.walletAddress.toLowerCase();

      const walletState = getWalletState(sliceState, walletAddress);
      const balance = action.payload.balance;

      addTokenBalanceToState(walletState, vault.chainId, balance.tokens);
      addGovVaultBalanceToState(walletState, balance.govVaults);
      addBoostBalanceToState(state, walletState, balance.boosts);
    });

    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      if (!action.payload.walletAddress) {
        return;
      }
      const minter = selectMinterById(action.payload.state, action.payload.minterId);
      const walletAddress = action.payload.walletAddress.toLowerCase();

      const walletState = getWalletState(sliceState, walletAddress);
      const balance = action.payload.balance;

      addTokenBalanceToState(walletState, minter.chainId, balance.tokens);
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        const state = action.payload.state;
        const chainId = action.payload.chainId;
        const walletAddress = action.payload.walletAddress.toLowerCase();

        const walletState = getWalletState(sliceState, walletAddress);
        const balance = action.payload.balance;

        addTokenBalanceToState(walletState, chainId, balance.tokens);
        addGovVaultBalanceToState(walletState, balance.govVaults);
        addBoostBalanceToState(state, walletState, balance.boosts);
      }
    );

    builder.addCase(recalculateDepositedVaultsAction.fulfilled, (sliceState, action) => {
      const walletState = getWalletState(sliceState, action.payload.walletAddress.toLowerCase());
      // avoid updating if the data is the same
      if (
        action.payload.vaultIds.length !== walletState.depositedVaultIds.length ||
        action.payload.vaultIds.some(id => !walletState.depositedVaultIds.includes(id))
      ) {
        walletState.depositedVaultIds = action.payload.vaultIds;
      }
    });
  },
});

function getWalletState(sliceState: Draft<BalanceState>, walletAddress: string) {
  if (sliceState.byAddress[walletAddress] === undefined) {
    sliceState.byAddress[walletAddress] = {
      depositedVaultIds: [],
      tokenAmount: {
        byChainId: {},
        byBoostId: {},
        byGovVaultId: {},
      },
    };
  }

  return sliceState.byAddress[walletAddress];
}

function addBalancesToState(
  sliceState: Draft<BalanceState>,
  payload: FetchAllBalanceFulfilledPayload
) {
  const state = payload.state;
  const chainId = payload.chainId;
  const walletAddress = payload.walletAddress.toLowerCase();
  const walletState = getWalletState(sliceState, walletAddress);
  const balance = payload.data;

  addTokenBalanceToState(walletState, chainId, balance.tokens);
  addBoostBalanceToState(state, walletState, balance.boosts);
  addGovVaultBalanceToState(walletState, balance.govVaults);
}

function addTokenBalanceToState(
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  chainId: ChainEntity['id'],
  balances: TokenBalance[]
) {
  /**
   * Ingest token data
   */
  for (const tokenBalance of balances) {
    let byChainId = walletState.tokenAmount.byChainId[chainId];
    if (byChainId === undefined) {
      byChainId = walletState.tokenAmount.byChainId[chainId] = { byTokenAddress: {} };
    }

    // only update data if necessary
    const tokenKey = tokenBalance.tokenAddress.toLowerCase();
    const stateForToken = byChainId.byTokenAddress[tokenKey];
    if (
      // state isn't already there if it's there, only if amount differ
      stateForToken === undefined ||
      !stateForToken.balance.isEqualTo(tokenBalance.amount)
    ) {
      byChainId.byTokenAddress[tokenKey] = {
        balance: tokenBalance.amount,
      };
    }
  }
}

function addGovVaultBalanceToState(
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  govVaultBalance: GovVaultV2Balance[]
) {
  for (const vaultBalance of govVaultBalance) {
    const vaultId = vaultBalance.vaultId;

    // bug with old bifi gov pool
    if (vaultId === 'bifi-gov-eol') {
      vaultBalance.rewards = vaultBalance.rewards.map(reward => ({ ...reward, amount: BIG_ZERO }));
    }

    // only update data if necessary
    const stateForVault = walletState.tokenAmount.byGovVaultId[vaultId];
    if (
      // state isn't already there and if it's there, only if amount differ
      stateForVault === undefined ||
      !stateForVault.balance.isEqualTo(vaultBalance.balance) ||
      stateForVault.rewards.length !== vaultBalance.rewards.length ||
      stateForVault.rewards.some(
        (reward, i) =>
          !reward.amount.isEqualTo(vaultBalance.rewards[i].amount) ||
          reward.tokenAddress !== vaultBalance.rewards[i].tokenAddress
      )
    ) {
      walletState.tokenAmount.byGovVaultId[vaultId] = {
        rewards: vaultBalance.rewards,
        balance: vaultBalance.balance,
      };
    }
  }
}

function addBoostBalanceToState(
  state: BeefyState,
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  boostBalances: BoostBalance[]
) {
  for (const boostBalance of boostBalances) {
    // only update data if necessary
    const stateForBoost = walletState.tokenAmount.byBoostId[boostBalance.boostId];
    if (
      stateForBoost === undefined ||
      !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
      !stateForBoost.rewards.isEqualTo(boostBalance.rewards)
    ) {
      walletState.tokenAmount.byBoostId[boostBalance.boostId] = {
        balance: boostBalance.balance,
        rewards: boostBalance.rewards,
      };
    }
  }
}
