import BigNumber from 'bignumber.js';
import type { Address } from 'viem';
import { Erc4626VaultAbi } from '../../../../../config/abi/Erc4626VaultAbi.ts';
import { StandardVaultAbi } from '../../../../../config/abi/StandardVaultAbi.ts';
import { BIG_ZERO, fromWei, toWei } from '../../../../../helpers/big-number.ts';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import type { VaultEntity, VaultErc4626, VaultStandard } from '../../../entities/vault.ts';
import { selectFeesByVaultId } from '../../../selectors/fees.ts';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults.ts';
import type { BeefyState } from '../../../store/types.ts';
import { mooAmountToOracleAmount, oracleAmountToMooAmount } from '../../../utils/ppfs.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import type { InputTokenAmount, TokenAmount } from '../transact-types.ts';

/**
 * Shared ppfs/vault conversion logic — the single source of truth used by both the
 * transact vault types (IPpfsVaultType implementers) and the wallet actions.
 */

// getPricePerFullShare exists on both StandardVaultAbi and Erc4626VaultAbi with the same signature
const PpfsAbi = [
  {
    inputs: [],
    name: 'getPricePerFullShare',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

type PpfsVaultCtx<TVault extends VaultStandard | VaultErc4626 = VaultStandard | VaultErc4626> = {
  vault: TVault;
  depositToken: TokenEntity;
  shareToken: TokenErc20;
};

export function calcDepositFee(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  input: TokenAmount
): BigNumber {
  const fees = selectFeesByVaultId(state, vaultId);
  const depositFeePercent = fees?.deposit || 0;
  return depositFeePercent > 0 ?
      input.amount
        .multipliedBy(depositFeePercent)
        .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
    : BIG_ZERO;
}

export function calcWithdrawFee(
  state: BeefyState,
  vaultId: VaultEntity['id'],
  grossOutput: TokenAmount
): BigNumber {
  const fees = selectFeesByVaultId(state, vaultId);
  const withdrawFeePercent = fees?.withdraw || 0;
  return withdrawFeePercent > 0 ?
      grossOutput.amount
        .multipliedBy(withdrawFeePercent)
        .decimalPlaces(grossOutput.token.decimals, BigNumber.ROUND_FLOOR)
    : BIG_ZERO;
}

// state-ppfs estimate of the deposit-token output for a share input, net of withdraw fee
export function withdrawOutputFromState(
  state: BeefyState,
  ctx: PpfsVaultCtx,
  input: TokenAmount
): TokenAmount<TokenEntity> {
  const ppfs = selectVaultPricePerFullShare(state, ctx.vault.id);
  const grossAssets = mooAmountToOracleAmount(ctx.shareToken, ctx.depositToken, ppfs, input.amount);
  const withdrawFee = calcWithdrawFee(state, ctx.vault.id, {
    token: ctx.depositToken,
    amount: grossAssets,
  });
  return { token: ctx.depositToken, amount: grossAssets.minus(withdrawFee) };
}

// state-ppfs estimate of the shares minted for a deposit-token input, net of deposit fee
export function depositSharesFromState(
  state: BeefyState,
  ctx: PpfsVaultCtx,
  input: TokenAmount
): TokenAmount<TokenErc20> {
  const depositFee = calcDepositFee(state, ctx.vault.id, input);
  const ppfs = selectVaultPricePerFullShare(state, ctx.vault.id);
  return {
    token: ctx.shareToken,
    amount: oracleAmountToMooAmount(
      ctx.shareToken,
      ctx.depositToken,
      ppfs,
      input.amount.minus(depositFee)
    ),
  };
}

// live deposit-token→shares conversion via getPricePerFullShare, net of deposit fee (shared by both vault types)
export async function resolveDepositSharesLive(
  state: BeefyState,
  ctx: PpfsVaultCtx,
  input: TokenAmount
): Promise<TokenAmount<TokenErc20>> {
  const { vault, shareToken } = ctx;
  const vaultContract = fetchContract(vault.contractAddress, PpfsAbi, vault.chainId);
  const ppfsRaw = await vaultContract.read.getPricePerFullShare();
  const ppfs = new BigNumber(ppfsRaw.toString(10));
  const depositFee = calcDepositFee(state, vault.id, input);
  const inputWeiAfterFee = toWei(input.amount.minus(depositFee), input.token.decimals);
  const expectedShares = inputWeiAfterFee.shiftedBy(shareToken.decimals).dividedToIntegerBy(ppfs);
  return {
    token: shareToken,
    amount: fromWei(expectedShares, shareToken.decimals),
  };
}

// live shares→deposit-token conversion for standard vaults, matching what the contract's withdraw() computes
export async function resolveStandardWithdrawLive(
  state: BeefyState,
  ctx: PpfsVaultCtx<VaultStandard>,
  input: InputTokenAmount,
  userAddress: string
): Promise<{ sharesToWithdrawWei: BigNumber; output: TokenAmount }> {
  const { vault, depositToken, shareToken } = ctx;
  const vaultContract = fetchContract(vault.contractAddress, StandardVaultAbi, vault.chainId);
  const [balance, totalSupply, userShares] = await Promise.all([
    vaultContract.read.balance(),
    vaultContract.read.totalSupply(),
    vaultContract.read.balanceOf([userAddress as Address]),
  ]);
  const vaultBalanceWei = new BigNumber(balance.toString(10));
  const vaultTotalSupplyWei = new BigNumber(totalSupply.toString(10));
  const userSharesWei = new BigNumber(userShares.toString(10));

  // max means the live on-chain balance; typed amounts fail here rather than reverting after signing
  const sharesToWithdrawWei = input.max ? userSharesWei : toWei(input.amount, shareToken.decimals);
  if (!input.max && sharesToWithdrawWei.gt(userSharesWei)) {
    throw new Error('Withdrawal amount exceeds current share balance');
  }

  const grossAssets = fromWei(
    sharesToWithdrawWei.multipliedBy(vaultBalanceWei).dividedToIntegerBy(vaultTotalSupplyWei),
    depositToken.decimals
  );
  const withdrawFee = calcWithdrawFee(state, vault.id, {
    token: depositToken,
    amount: grossAssets,
  });
  return {
    sharesToWithdrawWei,
    output: { token: depositToken, amount: grossAssets.minus(withdrawFee) },
  };
}

// live shares→deposit-token conversion for erc4626 vaults (no balance(): use ppfs), net of withdraw fee
export async function resolveErc4626WithdrawOutputLive(
  state: BeefyState,
  ctx: PpfsVaultCtx<VaultErc4626>,
  sharesWei: BigNumber
): Promise<TokenAmount<TokenEntity>> {
  const { vault, depositToken, shareToken } = ctx;
  const vaultContract = fetchContract(vault.contractAddress, Erc4626VaultAbi, vault.chainId);
  const ppfsRaw = await vaultContract.read.getPricePerFullShare();
  const ppfs = new BigNumber(ppfsRaw.toString(10));
  const grossAssets = fromWei(
    sharesWei.multipliedBy(ppfs).dividedToIntegerBy(new BigNumber(10).pow(shareToken.decimals)),
    depositToken.decimals
  );
  const withdrawFee = calcWithdrawFee(state, vault.id, {
    token: depositToken,
    amount: grossAssets,
  });
  return { token: depositToken, amount: grossAssets.minus(withdrawFee) };
}
