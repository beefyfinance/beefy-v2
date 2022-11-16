import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllAllowanceAction, fetchAllowanceAction } from '../../actions/allowance';
import { TokenAllowance } from '../../apis/allowance/allowance-types';
import { WritableDraft } from 'immer/dist/internal';
import { ChainEntity } from '../../entities/chain';
import { TokenEntity } from '../../entities/token';
import { accountHasChanged, walletHasDisconnected } from './wallet';
import { selectVaultById } from '../../selectors/vaults';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens';
import { initiateBoostForm } from '../../actions/boosts';
import { selectBoostById } from '../../selectors/boosts';
import { initiateMinterForm } from '../../actions/minters';
import { initiateBridgeForm } from '../../actions/bridge';
import { selectMinterById } from '../../selectors/minters';

/**
 * State containing user allowances state
 * Allowance being the amount allowed to be spent big a contract
 * for the currently connected user
 */
export interface AllowanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenAddress: {
        [tokenAddress: TokenEntity['address']]: {
          bySpenderAddress: {
            [spenderAddress: string]: BigNumber;
          };
        };
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

    builder.addCase(fetchAllAllowanceAction.fulfilled, (sliceState, action) => {
      const chainId = action.payload.chainId;
      const allowances = action.payload.data;
      addAllowancesToState(sliceState, chainId, allowances);
    });
    builder.addCase(fetchAllowanceAction.fulfilled, (sliceState, action) => {
      addAllowancesToState(sliceState, action.payload.chainId, action.payload.data);
    });
    builder.addCase(initiateBoostForm.fulfilled, (sliceState, action) => {
      const boost = selectBoostById(action.payload.state, action.payload.boostId);
      const vault = selectVaultById(action.payload.state, boost.vaultId);
      addAllowancesToState(sliceState, vault.chainId, action.payload.allowance);
    });
    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      const minter = selectMinterById(action.payload.state, action.payload.minterId);
      addAllowancesToState(sliceState, minter.chainId, action.payload.allowance);
    });
    builder.addCase(initiateBridgeForm.fulfilled, (sliceState, action) => {
      addAllowancesToState(sliceState, action.payload.chainId, action.payload.allowance);
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        const chainId = action.payload.chainId;
        const allowances = action.payload.allowance;
        addAllowancesToState(sliceState, chainId, allowances);
      }
    );
  },
});

function addAllowancesToState(
  sliceState: WritableDraft<AllowanceState>,
  chainId: ChainEntity['id'],
  allowances: TokenAllowance[]
) {
  let stateForChain = sliceState.byChainId[chainId];
  if (stateForChain === undefined) {
    sliceState.byChainId[chainId] = { byTokenAddress: {} };
    stateForChain = sliceState.byChainId[chainId];
  }

  for (const tokenAllowance of allowances) {
    let stateForToken = stateForChain.byTokenAddress[tokenAllowance.tokenAddress.toLowerCase()];
    if (stateForToken === undefined) {
      stateForChain.byTokenAddress[tokenAllowance.tokenAddress.toLowerCase()] = {
        bySpenderAddress: {},
      };
      stateForToken = stateForChain.byTokenAddress[tokenAllowance.tokenAddress.toLowerCase()];
    }

    // only update data if necessary
    const spender = tokenAllowance.spenderAddress.toLowerCase();
    let stateForSpender = stateForToken.bySpenderAddress[spender];
    if (stateForSpender === undefined || !stateForSpender.isEqualTo(tokenAllowance.allowance)) {
      stateForToken.bySpenderAddress[spender] = tokenAllowance.allowance;
    }
  }
}
