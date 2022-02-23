import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { isArray } from 'lodash';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateWithdrawForm } from '../../actions/withdraw';
import { fetchEstimateZapWithdraw } from '../../actions/zap';
import { ZapEstimate, ZapOptions } from '../../apis/zap';
import { TokenEntity } from '../../entities/token';
import { isGovVault, VaultEntity } from '../../entities/vault';
import {
  selectStandardVaultUserBalanceInOracleTokenExcludingBoosts,
  selectGovVaultUserBalanceInMooToken,
  selectUserBalanceOfToken,
} from '../../selectors/balance';
import { selectTokenById } from '../../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../../selectors/vaults';
import { mooAmountToOracleAmount } from '../../utils/ppfs';

// TODO: this looks exactly like the deposit state
export type WithdrawState = {
  initiated: boolean;
  vaultId: VaultEntity['id'];
  /** if we do a beefOut, we are actually withdrawing with both LP asset,
   * so we don't have just one selectedToken */
  selectedToken: TokenEntity | TokenEntity[];
  isZap: boolean; // tell us if it's a zap that has been selected
  isZapSwap: boolean; // true if we use a zap + swap
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
  slippageTolerance: number;
  zapOptions: ZapOptions | null;
  zapEstimate: ZapEstimate | null;
};
const initialWithdrawState: WithdrawState = {
  initiated: false,
  amount: BIG_ZERO,
  vaultId: null,
  slippageTolerance: 0.01,
  formattedInput: '',
  isZap: false,
  isZapSwap: false,
  zapOptions: null,
  zapEstimate: null,
  max: false,
  selectedToken: null,
};

export const withdrawSlice = createSlice({
  name: 'withdraw',
  initialState: initialWithdrawState,
  reducers: {
    setAsset(
      sliceState,
      action: PayloadAction<{
        selectedToken: TokenEntity['id'] | TokenEntity['id'][];
        state: BeefyState;
      }>
    ) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const selectedToken = isArray(action.payload.selectedToken)
        ? action.payload.selectedToken.map(tokenId =>
            selectTokenById(state, vault.chainId, tokenId)
          )
        : selectTokenById(state, vault.chainId, action.payload.selectedToken);

      sliceState.selectedToken = selectedToken;

      if (isArray(selectedToken)) {
        sliceState.zapEstimate = {
          tokenIn: selectTokenById(state, vault.chainId, vault.assetIds[0]),
          tokenOut: selectTokenById(state, vault.chainId, vault.assetIds[1]),
          amountIn: BIG_ZERO,
          amountOut: BIG_ZERO,
        };
      }

      // also reset the input
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.isZap =
        isArray(sliceState.selectedToken) || vault.oracleId !== sliceState.selectedToken.id;
      sliceState.max = false;
      sliceState.isZapSwap =
        sliceState.isZap &&
        !isArray(sliceState.selectedToken) &&
        vault.assetIds.includes(sliceState.selectedToken.id);
    },

    setMax(sliceState, action: PayloadAction<{ state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);

      const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
      const mooTokenBalance = isGovVault(vault)
        ? selectGovVaultUserBalanceInMooToken(state, vault.id)
        : selectStandardVaultUserBalanceInOracleTokenExcludingBoosts(state, vault.id);

      // we output the amount is oracle token amount
      sliceState.amount = mooTokenBalance;
      sliceState.formattedInput = formatBigDecimals(mooTokenBalance, oracleToken.decimals);
      sliceState.max = true;
    },

    setInput(sliceState, action: PayloadAction<{ amount: string; state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(oracleToken.decimals, BigNumber.ROUND_DOWN);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const mooToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
      const mooTokenBalance = selectUserBalanceOfToken(state, vault.chainId, vault.earnedTokenId);
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const amount = mooAmountToOracleAmount(mooToken, oracleToken, ppfs, mooTokenBalance);
      if (value.isGreaterThanOrEqualTo(amount)) {
        value = new BigNumber(amount);
        sliceState.max = true;
      } else {
        sliceState.max = false;
      }

      const formattedInput = (() => {
        if (value.isEqualTo(input)) return input;
        if (input === '') return '';
        if (input === '.') return `0.`;
        return formatBigNumberSignificant(value);
      })();

      sliceState.formattedInput = formattedInput;
      sliceState.amount = value;
    },
  },
  extraReducers: builder => {
    builder.addCase(initiateWithdrawForm.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      const vault = selectVaultById(state, action.payload.vaultId);
      sliceState.vaultId = vault.id;
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.initiated = true;
      sliceState.max = false;
      sliceState.zapOptions = action.payload.zapOptions;

      // select the vault oracle token by default
      const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
      sliceState.selectedToken = oracleToken;

      sliceState.isZap = sliceState.selectedToken.id !== vault.oracleId;
      sliceState.isZapSwap =
        sliceState.isZap &&
        !isArray(sliceState.selectedToken) &&
        vault.assetIds.includes(sliceState.selectedToken.id);
    });

    builder.addCase(fetchEstimateZapWithdraw.fulfilled, (sliceState, action) => {
      if (
        sliceState.vaultId === action.payload.vaultId &&
        !isArray(sliceState.selectedToken) &&
        sliceState.selectedToken.id === action.payload.outputTokenId &&
        sliceState.zapEstimate !== action.payload.zapEstimate
      ) {
        sliceState.zapEstimate = action.payload.zapEstimate;
      }
    });
  },
});

export const withdrawActions = withdrawSlice.actions;
