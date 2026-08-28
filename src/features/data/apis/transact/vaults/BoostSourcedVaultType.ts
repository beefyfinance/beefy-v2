import type BigNumber from 'bignumber.js';
import { BIG_ZERO, toWei } from '../../../../../helpers/big-number.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import { selectBoostUserBalanceInToken } from '../../../selectors/balance.ts';
import type { ZapTransactHelpers } from '../strategies/IStrategy.ts';
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
import {
  isStandardVaultType,
  type IStandardVaultType,
  type VaultDepositRequest,
  type VaultDepositResponse,
  type VaultWithdrawRequest,
  type VaultWithdrawResponse,
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

/**
 * The withdraw share math reads the user's wallet share balance, which is zero while the position is
 * staked. `helpersCache` shares one object per (state, vault) across both directions and every
 * strategy, so the swapped vault type has to go on a copy.
 */
export function withBoostSourcedVaultType(
  helpers: ZapTransactHelpers,
  boostId: BoostPromoEntity['id'] | undefined
): ZapTransactHelpers {
  if (!boostId || !isStandardVaultType(helpers.vaultType)) {
    return helpers;
  }
  const shares = selectBoostUserBalanceInToken(helpers.getState(), boostId);
  if (shares.lte(BIG_ZERO)) {
    return helpers;
  }
  return {
    ...helpers,
    vaultType: new BoostSourcedStandardVaultType(
      helpers.vaultType,
      toWei(shares, helpers.vaultType.shareToken.decimals)
    ),
  };
}
