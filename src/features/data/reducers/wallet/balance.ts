import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import type { Draft } from 'immer';
import { uniq } from 'lodash-es';
import type { BeefyState } from '../../../../redux-types';
import type { FetchAllBalanceFulfilledPayload } from '../../actions/balance';
import { fetchAllBalanceAction, fetchBalanceAction } from '../../actions/balance';
import { initiateBoostForm } from '../../actions/boosts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens';
import type {
  BoostBalance,
  GovVaultPoolBalance,
  TokenBalance,
} from '../../apis/balance/balance-types';
import type { BoostEntity } from '../../entities/boost';
import type { ChainEntity } from '../../entities/chain';
import type { TokenEntity } from '../../entities/token';
import type { VaultEntity } from '../../entities/vault';
import { selectAllVaultBoostIds, selectBoostById } from '../../selectors/boosts';
import {
  selectIsStandardVaultEarnTokenAddress,
  selectStandardVaultByEarnTokenAddress,
  selectVaultById,
} from '../../selectors/vaults';
import { initiateMinterForm } from '../../actions/minters';
import { initiateBridgeForm } from '../../actions/bridge';
import { selectMinterById } from '../../selectors/minters';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { fetchUserSnapshotBalance } from '../../actions/snapshot-balance';

/**
 * State containing user balances state
 */
export interface BalanceState {
  // we want to keep everything by address to be able to display the right
  // data even when the user quickly changes account
  byAddress: {
    [address: string]: {
      //temporal : snap balance
      snapshotBalance: {
        lp: BigNumber;
        excluded?: BigNumber;
      };

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
          [chainId: ChainEntity['id']]: {
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
            rewards: BigNumber;
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
      addTokenBalanceToState(state, walletState, vault.chainId, balance.tokens);
      addGovVaultBalanceToState(walletState, balance.govVaults);
      addBoostBalanceToState(state, walletState, balance.boosts);
    });

    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      if (!action.payload.walletAddress) {
        return;
      }
      const minter = selectMinterById(action.payload.state, action.payload.minterId);
      const walletAddress = action.payload.walletAddress.toLowerCase();

      const walletState = getWalletState(sliceState, walletAddress);
      const balance = action.payload.balance;
      addTokenBalanceToState(state, walletState, minter.chainId, balance.tokens);
    });

    builder.addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      if (!action.payload.walletAddress) {
        return;
      }

      const walletAddress = action.payload.walletAddress.toLocaleLowerCase();

      const walletState = getWalletState(sliceState, walletAddress);
      const balance = action.payload.balance;

      addTokenBalanceToState(state, walletState, action.payload.chainId, balance.tokens);
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        const state = action.payload.state;
        const chainId = action.payload.chainId;
        const walletAddress = action.payload.walletAddress.toLowerCase();

        const walletState = getWalletState(sliceState, walletAddress);
        const balance = action.payload.balance;
        addTokenBalanceToState(state, walletState, chainId, balance.tokens);
        addGovVaultBalanceToState(walletState, balance.govVaults);
        addBoostBalanceToState(state, walletState, balance.boosts);
      }
    );
    builder.addCase(fetchUserSnapshotBalance.fulfilled, (sliceState, action) => {
      const { balance, address } = action.payload;
      const { lp, excluded } = Object.values(balance).reduce(
        (total, balancePerChain) => {
          total['lp'] = total['lp'].plus(new BigNumber(balancePerChain.lp));
          // total['excluded'] = total['excluded'].plus(new BigNumber(chain[1].excluded));

          return total;
        },
        {
          lp: BIG_ZERO,
          excluded: BIG_ZERO,
        }
      );

      if (sliceState.byAddress[address.toLocaleLowerCase()] === undefined) {
        sliceState.byAddress[address.toLocaleLowerCase()].snapshotBalance = {
          lp: BIG_ZERO,
          excluded: BIG_ZERO,
        };
      }

      sliceState.byAddress[address.toLocaleLowerCase()].snapshotBalance = { lp, excluded };
    });
  },
});

function getWalletState(sliceState: Draft<BalanceState>, walletAddress: string) {
  if (sliceState.byAddress[walletAddress] === undefined) {
    sliceState.byAddress[walletAddress] = {
      snapshotBalance: {
        lp: BIG_ZERO,
        excluded: BIG_ZERO,
      },
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

  addTokenBalanceToState(state, walletState, chainId, balance.tokens);
  addBoostBalanceToState(state, walletState, balance.boosts);
  addGovVaultBalanceToState(walletState, balance.govVaults);
}

function addTokenBalanceToState(
  state: BeefyState,
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  chainId: ChainEntity['id'],
  balances: TokenBalance[]
) {
  /**
   * Ingest token data
   */
  for (const tokenBalance of balances) {
    if (walletState.tokenAmount.byChainId[chainId] === undefined) {
      walletState.tokenAmount.byChainId[chainId] = { byTokenAddress: {} };
    }

    // only update data if necessary
    const stateForToken =
      walletState.tokenAmount.byChainId[chainId].byTokenAddress[
        tokenBalance.tokenAddress.toLowerCase()
      ];
    if (
      // state isn't already there if it's there, only if amount differ
      stateForToken === undefined ||
      !stateForToken.balance.isEqualTo(tokenBalance.amount)
    ) {
      walletState.tokenAmount.byChainId[chainId].byTokenAddress[
        tokenBalance.tokenAddress.toLowerCase()
      ] = {
        balance: tokenBalance.amount,
      };

      // if the token is the earnedToken of a vault
      // this means the user deposited in this vault
      if (selectIsStandardVaultEarnTokenAddress(state, chainId, tokenBalance.tokenAddress)) {
        const vaultId = selectStandardVaultByEarnTokenAddress(
          state,
          chainId,
          tokenBalance.tokenAddress
        );

        // to decide if we want to add or remove the vault we consider both the boost and vault deposit
        // I know we are adding carrots and oignons here but it's just to check if > 0
        let totalDepositOrRewards = tokenBalance.amount;
        for (const boostId of selectAllVaultBoostIds(state, vaultId)) {
          const boostDeposit = walletState.tokenAmount.byBoostId[boostId]?.balance || BIG_ZERO;
          const boostRewards = walletState.tokenAmount.byBoostId[boostId]?.rewards || BIG_ZERO;
          totalDepositOrRewards = totalDepositOrRewards.plus(boostDeposit).plus(boostRewards);
        }
        addOrRemoveFromDepositedList(walletState, totalDepositOrRewards, vaultId);
      }
    }
  }
}

function addGovVaultBalanceToState(
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  govVaultBalance: GovVaultPoolBalance[]
) {
  for (const vaultBalance of govVaultBalance) {
    const vaultId = vaultBalance.vaultId;

    // bug with old bifi gov pool
    if (vaultId === 'bifi-gov-eol') {
      vaultBalance.rewards = BIG_ZERO;
    }

    // only update data if necessary
    const stateForVault = walletState.tokenAmount.byGovVaultId[vaultId];
    if (
      // state isn't already there if it's there, only if amount differ
      stateForVault === undefined ||
      !stateForVault.rewards.isEqualTo(vaultBalance.rewards)
    ) {
      const vaultState = {
        rewards: vaultBalance.rewards,
        balance: vaultBalance.balance,
      };
      walletState.tokenAmount.byGovVaultId[vaultId] = vaultState;

      addOrRemoveFromDepositedList(walletState, vaultBalance.balance, vaultBalance.vaultId);
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

  // once we added all boosts, find out if we have staked something in each vault
  const allVaultIds = uniq(
    boostBalances.map(boostBalance => {
      const boost = selectBoostById(state, boostBalance.boostId);
      return boost.vaultId;
    })
  );
  for (const vaultId of allVaultIds) {
    const vault = selectVaultById(state, vaultId);
    const vaultBalance =
      walletState.tokenAmount.byChainId[vault.chainId]?.byTokenAddress[
        vault.earnedTokenAddress.toLowerCase()
      ]?.balance || BIG_ZERO;
    let totalDepositOrRewards = new BigNumber(vaultBalance);
    for (const boostId of selectAllVaultBoostIds(state, vaultId)) {
      const boostDeposit = walletState.tokenAmount.byBoostId[boostId]?.balance || BIG_ZERO;
      const boostRewards = walletState.tokenAmount.byBoostId[boostId]?.rewards || BIG_ZERO;
      totalDepositOrRewards = totalDepositOrRewards.plus(boostDeposit).plus(boostRewards);
      addOrRemoveFromDepositedList(walletState, totalDepositOrRewards, vaultId);
    }
  }
}

function addOrRemoveFromDepositedList(
  walletState: Draft<BalanceState['byAddress']['0xABC']>,
  amount: BigNumber,
  vaultId: VaultEntity['id']
) {
  if (amount.isGreaterThan(0)) {
    if (!walletState.depositedVaultIds.includes(vaultId)) {
      walletState.depositedVaultIds.push(vaultId);
    }
  } else {
    if (walletState.depositedVaultIds.includes(vaultId)) {
      walletState.depositedVaultIds = walletState.depositedVaultIds.filter(vid => vid !== vaultId);
    }
  }
}
