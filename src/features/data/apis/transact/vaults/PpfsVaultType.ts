import { isTokenErc20, type TokenEntity, type TokenErc20 } from '../../../entities/token.ts';
import type { VaultWithPricePerFullShare } from '../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import {
  depositSharesFromState,
  resolveDepositSharesLive,
  withdrawOutputFromState,
} from '../helpers/ppfs-vault.ts';
import type { TokenAmount } from '../transact-types.ts';

/**
 * Shared base for the ppfs vault types (standard, erc4626). Holds the common constructor and
 * the IPpfsVaultType estimate/deposit surface, delegating the math to helpers/ppfs-vault.ts.
 */
export abstract class PpfsVaultType<TVault extends VaultWithPricePerFullShare> {
  public readonly vault: TVault;
  public readonly depositToken: TokenEntity;
  public readonly shareToken: TokenErc20;
  protected readonly getState: BeefyStateFn;

  constructor(vault: TVault, getState: BeefyStateFn) {
    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
    if (!isTokenErc20(shareToken)) {
      throw new Error('Share token is not an ERC20 token');
    }
    this.shareToken = shareToken;
  }

  estimateDepositShares(input: TokenAmount): TokenAmount<TokenErc20> {
    return depositSharesFromState(this.getState(), this, input);
  }

  estimateWithdrawOutput(input: TokenAmount): TokenAmount<TokenEntity> {
    return withdrawOutputFromState(this.getState(), this, input);
  }

  protected async resolveDepositLive(input: TokenAmount): Promise<TokenAmount<TokenErc20>> {
    return resolveDepositSharesLive(this.getState(), this, input);
  }
}
