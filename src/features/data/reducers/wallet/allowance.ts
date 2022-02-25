import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchAllAllowanceAction } from '../../actions/allowance';
import { initiateDepositForm } from '../../actions/deposit';
import { TokenAllowance } from '../../apis/allowance/allowance-types';
import { WritableDraft } from 'immer/dist/internal';
import { ChainEntity } from '../../entities/chain';
import { TokenEntity } from '../../entities/token';
import { accountHasChanged, walletHasDisconnected } from './wallet';
import { selectVaultById } from '../../selectors/vaults';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../../actions/tokens';
import { initiateWithdrawForm } from '../../actions/withdraw';
import { initiateBoostForm } from '../../actions/boosts';
import { selectBoostById } from '../../selectors/boosts';

/**
 * State containing user allowances state
 * Allowance being the amount allowed to be spent big a contract
 * for the currently connected user
 */
export interface AllowanceState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      byTokenId: {
        [tokenId: TokenEntity['id']]: {
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

    builder.addCase(initiateDepositForm.fulfilled, (sliceState, action) => {
      const vault = selectVaultById(action.payload.state, action.payload.vaultId);
      addAllowancesToState(sliceState, vault.chainId, action.payload.allowance);
    });
    builder.addCase(initiateWithdrawForm.fulfilled, (sliceState, action) => {
      const vault = selectVaultById(action.payload.state, action.payload.vaultId);
      addAllowancesToState(sliceState, vault.chainId, action.payload.allowance);
    });
    builder.addCase(initiateBoostForm.fulfilled, (sliceState, action) => {
      const boost = selectBoostById(action.payload.state, action.payload.boostId);
      const vault = selectVaultById(action.payload.state, boost.vaultId);
      addAllowancesToState(sliceState, vault.chainId, action.payload.allowance);
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
    sliceState.byChainId[chainId] = { byTokenId: {} };
    stateForChain = sliceState.byChainId[chainId];
  }

  for (const tokenAllowance of allowances) {
    let stateForToken = stateForChain.byTokenId[tokenAllowance.tokenId];
    if (stateForToken === undefined) {
      stateForChain.byTokenId[tokenAllowance.tokenId] = { bySpenderAddress: {} };
      stateForToken = stateForChain.byTokenId[tokenAllowance.tokenId];
    }

    // only update data if necessary
    const spender = tokenAllowance.spenderAddress.toLocaleLowerCase();
    let stateForSpender = stateForToken.bySpenderAddress[spender];
    if (stateForSpender === undefined || !stateForSpender.isEqualTo(tokenAllowance.allowance)) {
      stateForToken.bySpenderAddress[spender] = tokenAllowance.allowance;
    }
  }
}
