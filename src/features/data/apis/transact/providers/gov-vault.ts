import {
  GovVaultOption,
  GovVaultQuote,
  InputTokenAmount,
  ITransactProvider,
  QuoteOutputTokenAmount,
  TransactOption,
  TransactQuote,
} from '../transact-types';
import { isGovVault, VaultEntity } from '../../../entities/vault';
import { BeefyState } from '../../../../../redux-types';
import { selectGovVaultById, selectVaultById } from '../../../selectors/vaults';
import { createOptionId, createQuoteId, createTokensId } from '../utils';
import { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';
import { Namespace, TFunction } from 'react-i18next';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import { isTokenErc20, TokenErc20 } from '../../../entities/token';
import { selectGovVaultPendingRewardsInToken } from '../../../selectors/balance';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import { selectTokenByAddress } from '../../../selectors/tokens';

/**
 * Basic deposit/withdraw/claim from earnings pool (gov vault)
 */
export class GovVaultProvider implements ITransactProvider {
  getId() {
    return 'gov-vault';
  }

  protected async getModeOptionsFor(
    mode: TransactMode,
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);
    if (!isGovVault(vault)) {
      return null;
    }

    const depositTokenAddresses = [vault.depositTokenAddress];
    const depositTokenOption: GovVaultOption = {
      id: createOptionId(this.getId(), vaultId, vault.chainId, depositTokenAddresses),
      providerId: this.getId(),
      vaultId: vaultId,
      chainId: vault.chainId,
      tokenAddresses: depositTokenAddresses,
      tokensId: createTokensId(vault.chainId, depositTokenAddresses),
      type: 'gov-vault',
      mode: mode,
    };

    return [depositTokenOption];
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    return this.getModeOptionsFor(TransactMode.Deposit, vaultId, state);
  }

  async getDepositQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<GovVaultQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const vault = selectVaultById(state, option.vaultId);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'gov-vault',
      allowances: amounts
        .filter(tokenAmount => isTokenErc20(tokenAmount.token))
        .map(tokenAmount => ({
          token: tokenAmount.token as TokenErc20,
          amount: tokenAmount.amount,
          spenderAddress: vault.earnContractAddress,
        })),
      inputs: amounts,
      outputs: amounts,
    };
  }

  async getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectGovVaultById(state, option.vaultId);

    return {
      step: 'deposit-gov',
      message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
      action: walletActions.stakeGovVault(vault, quote.inputs[0].amount),
      pending: false,
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    return this.getModeOptionsFor(TransactMode.Withdraw, vaultId, state);
  }

  async getWithdrawQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<GovVaultQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const isWithdrawAll = amounts[0].max;
    let outputs: QuoteOutputTokenAmount[] = [...amounts];

    // if withdrawing all we can call exit() which also claims rewards
    if (isWithdrawAll) {
      const vault = selectGovVaultById(state, option.vaultId);
      const pendingRewardsAmount = selectGovVaultPendingRewardsInToken(state, vault.id);
      const rewardToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);

      if (pendingRewardsAmount.gt(BIG_ZERO)) {
        outputs.push({
          token: rewardToken,
          amount: pendingRewardsAmount,
        });
      }
    }

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'gov-vault',
      allowances: [],
      inputs: amounts,
      outputs: outputs,
    };
  }

  async getWithdrawStep(
    quote: GovVaultQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectGovVaultById(state, option.vaultId);
    const depositTokenAmount = quote.inputs[0];
    const isWithdrawAll = quote.inputs.every(tokenAmount => tokenAmount.max === true);

    if (isWithdrawAll) {
      const rewardTokenAmount =
        quote.outputs.length === 2
          ? quote.outputs[1]
          : {
              token: selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress),
              amount: BIG_ZERO,
            };

      return {
        step: 'claim-withdraw',
        message: t('Vault-TxnConfirm', { type: t('Claim-Withdraw-noun') }),
        action: walletActions.exitGovVault(vault),
        pending: false,
        extraInfo: {
          rewards: {
            token: rewardTokenAmount.token,
            amount: rewardTokenAmount.amount,
          },
        },
      };
    }

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.unstakeGovVault(vault, depositTokenAmount.amount),
      pending: false,
    };
  }
}
