import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { fetchAllAllowanceAction, fetchAllowanceAction } from '../../actions/allowance.ts';
import { initiateBoostForm } from '../../actions/boosts.ts';
import { initiateMinterForm } from '../../actions/minters.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens.ts';
import type { TokenAllowance } from '../../apis/allowance/allowance-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { selectMinterById } from '../../selectors/minters.ts';
import type { AllowanceState } from './allowance-types.ts';
import { accountHasChanged, walletHasDisconnected } from './wallet.ts';

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
      addAllowancesToState(sliceState, action.payload.boost.chainId, action.payload.allowance);
    });
    builder.addCase(initiateMinterForm.fulfilled, (sliceState, action) => {
      const minter = selectMinterById(action.payload.state, action.payload.minterId);
      addAllowancesToState(sliceState, minter.chainId, action.payload.allowance);
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
  sliceState: Draft<AllowanceState>,
  chainId: ChainEntity['id'],
  allowances: TokenAllowance[]
) {
  let stateForChain = sliceState.byChainId[chainId];
  if (stateForChain === undefined) {
    stateForChain = sliceState.byChainId[chainId] = { byTokenAddress: {} };
  }

  for (const tokenAllowance of allowances) {
    const tokenKey = tokenAllowance.tokenAddress.toLowerCase();
    let stateForToken = stateForChain.byTokenAddress[tokenKey];
    if (stateForToken === undefined) {
      stateForToken = stateForChain.byTokenAddress[tokenKey] = {
        bySpenderAddress: {},
      };
    }

    // only update data if necessary
    const spender = tokenAllowance.spenderAddress.toLowerCase();
    const stateForSpender = stateForToken.bySpenderAddress[spender];
    if (stateForSpender === undefined || !stateForSpender.isEqualTo(tokenAllowance.allowance)) {
      stateForToken.bySpenderAddress[spender] = tokenAllowance.allowance;
    }
  }
}
