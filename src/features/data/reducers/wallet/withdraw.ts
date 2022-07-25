import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { isArray } from 'lodash';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { initiateWithdrawForm } from '../../actions/withdraw';
import { fetchEstimateZapWithdraw } from '../../actions/zap';
import { TokenEntity } from '../../entities/token';
import { isGovVault, VaultEntity } from '../../entities/vault';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenExcludingBoosts,
  selectUserBalanceOfToken,
} from '../../selectors/balance';
import { selectTokenByAddress, selectTokenById } from '../../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../../selectors/vaults';
import { mooAmountToOracleAmount } from '../../utils/ppfs';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { ZapOptions, ZapWithdrawEstimate } from '../../apis/zap/zap-types';

// TODO: this looks exactly like the deposit state
export type WithdrawState = {
  initiated: boolean;
  vaultId: VaultEntity['id'];
  /** if we do a beefOut, we are actually withdrawing with both LP asset,
   * so we don't have just one selectedToken */
  selectedToken: TokenEntity | TokenEntity[] | null; // null means form is not loaded yet
  isZap: boolean; // tell us if it's a zap that has been selected
  isZapSwap: boolean; // true if we use a zap + swap
  max: boolean; // this is so we know when to disable the max button
  amount: BigNumber;
  formattedInput: string;
  slippageTolerance: number;
  zapOptions: ZapOptions | null;
  zapEstimate: ZapWithdrawEstimate | null;
  zapError: string | null;
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
  zapError: null,
  max: false,
  selectedToken: null,
};

export const withdrawSlice = createSlice({
  name: 'withdraw',
  initialState: initialWithdrawState,
  reducers: {
    resetForm() {
      return initialWithdrawState;
    },

    setZapOptions(sliceState, action: PayloadAction<ZapOptions>) {
      sliceState.zapOptions = action.payload;
    },

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
          totalOut: BIG_ZERO,
          priceImpact: 0,
        };
      }

      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

      // also reset the input
      sliceState.amount = BIG_ZERO;
      sliceState.formattedInput = '';
      sliceState.isZap =
        isArray(sliceState.selectedToken) ||
        depositToken.address !== sliceState.selectedToken.address;
      sliceState.max = false;
      sliceState.isZapSwap =
        sliceState.isZap &&
        !isArray(sliceState.selectedToken) &&
        vault.assetIds.includes(sliceState.selectedToken.id);
    },

    setMax(sliceState, action: PayloadAction<{ state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);

      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      const oracleBalance = isGovVault(vault)
        ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
        : selectStandardVaultUserBalanceInDepositTokenExcludingBoosts(state, vault.id);

      // we output the amount is oracle token amount
      sliceState.amount = oracleBalance;
      // round a bit to account for ppfs inacuracies
      const truncatedMooBalance = oracleBalance.decimalPlaces(depositToken.decimals - 2);
      sliceState.formattedInput = formatBigDecimals(truncatedMooBalance, depositToken.decimals);
      sliceState.max = true;
    },

    setInput(sliceState, action: PayloadAction<{ amount: string; state: BeefyState }>) {
      const state = action.payload.state;
      const vault = selectVaultById(state, sliceState.vaultId);
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      const input = action.payload.amount.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

      let value = new BigNumber(input).decimalPlaces(depositToken.decimals, BigNumber.ROUND_DOWN);

      if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
        value = BIG_ZERO;
      }

      const mooToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
      const mooTokenBalance = isGovVault(vault)
        ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
        : selectUserBalanceOfToken(state, vault.chainId, vault.earnedTokenAddress);
      const ppfs = selectVaultPricePerFullShare(state, vault.id);
      const amount = mooAmountToOracleAmount(mooToken, depositToken, ppfs, mooTokenBalance);
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
    // on init, fetch zap options
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
      const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
      sliceState.selectedToken = depositToken;

      sliceState.isZap = false;
      sliceState.isZapSwap = false;
    });

    builder.addCase(fetchEstimateZapWithdraw.fulfilled, (sliceState, action) => {
      if (
        sliceState.vaultId === action.payload.vaultId &&
        !isArray(sliceState.selectedToken) &&
        sliceState.selectedToken.id === action.payload.outputTokenId &&
        sliceState.zapEstimate !== action.payload.zapEstimate
      ) {
        sliceState.zapEstimate = action.payload.zapEstimate;
        sliceState.zapError = null;
      }
    });

    builder.addCase(fetchEstimateZapWithdraw.pending, (sliceState, action) => {
      if (
        sliceState.vaultId === action.meta.arg.vaultId &&
        !isArray(sliceState.selectedToken) &&
        sliceState.selectedToken.id === action.meta.arg.outputTokenId
      ) {
        // TODO clear previous error/estimate so we can show loading indicator
        // TODO component needs refactored to reduce re-renders before this can be introduced
        // sliceState.zapEstimate = null;
        // sliceState.zapError = null;
      }
    });

    builder.addCase(fetchEstimateZapWithdraw.rejected, (sliceState, action) => {
      if (
        sliceState.vaultId === action.meta.arg.vaultId &&
        !isArray(sliceState.selectedToken) &&
        sliceState.selectedToken.id === action.meta.arg.outputTokenId
      ) {
        // TODO setting to null disables form
        // sliceState.zapEstimate = null;
        sliceState.zapError = action.error.message;
      }
    });
  },
});

export const withdrawActions = withdrawSlice.actions;
