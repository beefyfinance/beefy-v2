import { BigNumber } from 'bignumber.js';
import { ITransactProvider, TransactOption, VaultOption, VaultQuote } from '../transact-types';
import { VaultEntity } from '../../../entities/vault';
import { BeefyState } from '../../../../../redux-types';
import { selectVaultById } from '../../../selectors/vaults';
import { TransactMode } from '../../../reducers/wallet/transact';
import { createOptionId, createTokensId } from '../utils';

/**
 * Basic deposit/withdraw of single token handled by the vault contract
 */
export class VaultProvider implements ITransactProvider {
  public readonly id: string = 'vault';

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);
    const depositTokenAddresses = [vault.depositTokenAddress];
    const depositTokenOption: VaultOption = {
      id: createOptionId('vault', vaultId, vault.chainId, depositTokenAddresses),
      providerId: 'vault',
      vaultId: vaultId,
      chainId: vault.chainId,
      tokenAddresses: depositTokenAddresses,
      tokensId: createTokensId(vault.chainId, depositTokenAddresses),
      type: 'vault',
      mode: TransactMode.Deposit,
    };

    return [depositTokenOption];
  }

  async getDepositQuoteFor(option: TransactOption, amount: BigNumber): Promise<VaultQuote> {
    return {
      optionId: option.id,
      type: 'vault',
      amount,
    };
  }

  async getWithdrawOptionsFor(vaultId: VaultEntity['id'], state: BeefyState): Promise<void | null> {
    return Promise.resolve(undefined);
  }
}
