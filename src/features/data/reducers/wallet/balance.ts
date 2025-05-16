import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import {
  fetchAllBalanceAction,
  type FetchAllBalanceFulfilledPayload,
  fetchBalanceAction,
  recalculateDepositedVaultsAction,
} from '../../actions/balance.ts';
import { initiateBoostForm } from '../../actions/boosts.ts';
import { initiateMinterForm } from '../../actions/minters.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens.ts';
import type {
  BoostBalance,
  Erc4626PendingBalance,
  GovVaultBalance,
  TokenBalance,
} from '../../apis/balance/balance-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { selectMinterById } from '../../selectors/minters.ts';
import type { BalanceState } from './balance-types.ts';

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
      if (!action.payload.walletAddress) {
        return;
      }
      const boost = action.payload.boost;
      const walletAddress = action.payload.walletAddress.toLowerCase();

      const walletState = getWalletState(sliceState, walletAddress);
      const balance = action.payload.balance;

      addTokenBalanceToState(walletState, boost.chainId, balance.tokens);
      addGovVaultBalanceToState(walletState, balance.govVaults);
      addBoostBalanceToState(walletState, balance.boosts);
      addVaultPendingToState(walletState, balance.erc4626Pending);
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
        const chainId = action.payload.chainId;
        const walletAddress = action.payload.walletAddress.toLowerCase();

        const walletState = getWalletState(sliceState, walletAddress);
        const balance = action.payload.balance;

        addTokenBalanceToState(walletState, chainId, balance.tokens);
        addGovVaultBalanceToState(walletState, balance.govVaults);
        addBoostBalanceToState(walletState, balance.boosts);
        addVaultPendingToState(walletState, balance.erc4626Pending);
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
        byVaultId: {},
      },
    };
  }

  return sliceState.byAddress[walletAddress];
}

function addBalancesToState(
  sliceState: Draft<BalanceState>,
  payload: FetchAllBalanceFulfilledPayload
) {
  const chainId = payload.chainId;
  const walletAddress = payload.walletAddress.toLowerCase();
  const walletState = getWalletState(sliceState, walletAddress);
  const balance = payload.data;

  addTokenBalanceToState(walletState, chainId, balance.tokens);
  addBoostBalanceToState(walletState, balance.boosts);
  addGovVaultBalanceToState(walletState, balance.govVaults);
  addVaultPendingToState(walletState, balance.erc4626Pending);
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
  govVaultBalance: GovVaultBalance[]
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
          reward.token.address !== vaultBalance.rewards[i].token.address
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
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  boostBalances: BoostBalance[]
) {
  for (const boostBalance of boostBalances) {
    const boostId = boostBalance.boostId;

    // only update data if necessary
    const stateForBoost = walletState.tokenAmount.byBoostId[boostId];
    if (
      // state isn't already there and if it's there, only if amount differ
      stateForBoost === undefined ||
      !stateForBoost.balance.isEqualTo(boostBalance.balance) ||
      stateForBoost.rewards.length !== boostBalance.rewards.length ||
      stateForBoost.rewards.some(
        (reward, i) =>
          !reward.amount.isEqualTo(boostBalance.rewards[i].amount) ||
          reward.token.address !== boostBalance.rewards[i].token.address
      )
    ) {
      walletState.tokenAmount.byBoostId[boostId] = {
        rewards: boostBalance.rewards,
        balance: boostBalance.balance,
      };
    }
  }
}

function addVaultPendingToState(
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  erc4626Pending: Erc4626PendingBalance[]
) {
  for (const vaultPending of erc4626Pending) {
    // we only have async withdraw for now
    if (vaultPending.type !== 'withdraw') {
      continue;
    }

    const vaultId = vaultPending.vaultId;

    // only update data if necessary
    const stateForVault = walletState.tokenAmount.byVaultId[vaultId]?.pendingWithdrawals;
    if (
      // state isn't already there and if it's there, only if amount differ
      stateForVault === undefined ||
      !stateForVault.shares.isEqualTo(vaultPending.shares) ||
      stateForVault.requests.length !== vaultPending.requests.length ||
      stateForVault.requests.some(
        (request, i) =>
          !request.shares.isEqualTo(vaultPending.requests[i].shares) ||
          request.id !== vaultPending.requests[i].id
      )
    ) {
      walletState.tokenAmount.byVaultId[vaultId] ??= {
        pendingWithdrawals: { shares: BIG_ZERO, requests: [] },
      };
      walletState.tokenAmount.byVaultId[vaultId].pendingWithdrawals = {
        shares: vaultPending.shares,
        requests: vaultPending.requests,
      };
    }
  }
}
