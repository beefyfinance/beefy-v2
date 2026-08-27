import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import type { VaultStandard } from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import type {
  DepositOption,
  DepositQuote,
  InputTokenAmount,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../transact-types.ts';
import type {
  IStandardVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';

/**
 * The withdraw share math reads the user's wallet balance, which is zero while the position sits in
 * a boost. Wrapping the vault type feeds the boost balance to every strategy without touching any
 * of them, since they all reach the vault only through `fetchZapWithdraw`.
 */
export class BoostSourcedStandardVaultType implements IStandardVaultType {
  readonly id = 'standard' as const;

  constructor(
    private readonly inner: IStandardVaultType,
    private readonly sharesOverrideWei: BigNumber
  ) {}

  get vault(): VaultStandard {
    return this.inner.vault;
  }

  get depositToken(): TokenEntity {
    return this.inner.depositToken;
  }

  get shareToken(): TokenErc20 {
    return this.inner.shareToken;
  }

  fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    return this.inner.fetchZapWithdraw({ ...request, sharesOverrideWei: this.sharesOverrideWei });
  }

  fetchDepositOption(): Promise<DepositOption> {
    return this.inner.fetchDepositOption();
  }

  fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote> {
    return this.inner.fetchDepositQuote(inputs, option);
  }

  fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.inner.fetchDepositStep(quote, t);
  }

  fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    return this.inner.fetchZapDeposit(request);
  }

  fetchWithdrawOption(): Promise<WithdrawOption> {
    return this.inner.fetchWithdrawOption();
  }

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote> {
    return this.inner.fetchWithdrawQuote(inputs, option);
  }

  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.inner.fetchWithdrawStep(quote, t);
  }
}
