import { isStandardVault, VaultEntity, VaultStandard } from '../../../../entities/vault';
import { BeefyState } from '../../../../../../redux-types';
import { selectStandardVaultById, selectVaultById } from '../../../../selectors/vaults';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../../../../selectors/tokens';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../../../../entities/token';
import { first } from 'lodash';
import { ZapEntityBeefy } from '../../../../entities/zap';
import {
  InputTokenAmount,
  isZapQuoteStepSwap,
  ITransactProvider,
  TransactOption,
  ZapOption,
  ZapQuote,
} from '../../transact-types';
import { createOptionId, createTokensId } from '../../utils';
import { selectChainById } from '../../../../selectors/chains';
import { getWeb3Instance } from '../../../instances';
import { MultiCall } from 'eth-multicall';
import { BIG_ZERO, toWei } from '../../../../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { Namespace, TFunction } from 'react-i18next';
import { walletActions } from '../../../../actions/wallet-actions';
import { Step } from '../../../../reducers/wallet/stepper';
import {
  nativeToWNative,
  tokensToLp,
  tokensToZapIn,
  tokensToZapWithdraw,
  wnativeToNative,
} from '../../helpers/tokens';
import Web3 from 'web3';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { AmmEntity } from '../../../../entities/amm';
import { selectBeefyZapByAmmId, selectBeefyZapsByChainId } from '../../../../selectors/zap';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { ChainEntity } from '../../../../entities/chain';
import { getVaultWithdrawnFromState } from '../../helpers/vault';

export type BeefyZapOption<AmmType extends AmmEntity = AmmEntity> = {
  zap: ZapEntityBeefy;
  amm: AmmType;
  lpTokens: TokenEntity[];
} & ZapOption;

export type CommonDepositQuoteOptions<AmmType extends AmmEntity = AmmEntity> = {
  web3: Web3;
  multicall: MultiCall;
  chain: ChainEntity;
  depositToken: TokenEntity;
  swapTokenIn: TokenEntity;
  swapTokenOut: TokenEntity;
  userAmountInWei: BigNumber;
  option: BeefyZapOption<AmmType>;
  vault: VaultStandard;
  userInput: InputTokenAmount;
  amounts: InputTokenAmount[];
};

export type CommonWithdrawQuoteOptions<AmmType extends AmmEntity = AmmEntity> = {
  option: BeefyZapOption<AmmType>;
  web3: Web3;
  multicall: MultiCall;
  chain: ChainEntity;
  vault: VaultStandard;
  amounts: InputTokenAmount[];
  actualTokenOut: TokenEntity;
  swapTokenIn: TokenEntity;
  swapTokenOut: TokenEntity;
  withdrawnToken: TokenEntity;
  withdrawnAmountAfterFeeWei: BigNumber;
  shareToken: TokenErc20;
  sharesToWithdrawWei: BigNumber;
  native: TokenNative;
  wnative: TokenErc20;
};

type CommonOptionsData<AmmType extends AmmEntity = AmmEntity> = {
  vault: VaultStandard;
  zapTokens: TokenEntity[];
  zap: ZapEntityBeefy;
  amm: AmmType;
  lpTokens: TokenErc20[];
  native: TokenNative;
  wnative: TokenErc20;
};

/**
 * Deposit/withdraw via Beefy Zap Contracts
 */
export abstract class BeefyBaseZapProvider<AmmType extends AmmEntity> implements ITransactProvider {
  private depositCache: Record<string, BeefyZapOption<AmmType>[]> = {};
  private withdrawCache: Record<string, BeefyZapOption<AmmType>[]> = {};

  protected constructor(protected type: AmmType['type']) {}

  getId(): string {
    return `beefy-zap-${this.type}`;
  }

  abstract getAmm(
    amms: AmmEntity[],
    depositTokenAddress: TokenEntity['address'],
    lpTokens: TokenEntity[]
  ): AmmType | null;

  async getCommonOptionData(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<CommonOptionsData<AmmType>> {
    const vault = selectVaultById(state, vaultId);

    let zaps = selectBeefyZapsByChainId(state, vault.chainId);
    if (zaps === undefined || zaps.length === 0) {
      return null;
    }

    let amms = state.entities.amms.byChainId[vault.chainId];
    if (amms === undefined || amms.length === 0) {
      return null;
    }

    amms = amms.filter(amm => amm.type === this.type);
    if (amms === undefined || amms.length === 0) {
      return null;
    }

    if (!isStandardVault(vault)) {
      return null;
    }

    if (vault.assetIds.length !== 2) {
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        console.warn(this.getId(), `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);

    const amm = this.getAmm(amms, depositToken.address, lpTokens);
    if (!amm) {
      return null;
    }

    const zap = selectBeefyZapByAmmId(state, amm.id);
    if (!zap) {
      return null;
    }

    const zapTokens = tokensToZapIn(tokens, wnative, native);

    return { vault, zapTokens, zap, amm, lpTokens, native, wnative };
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<ZapOption[] | null> {
    if (vaultId in this.depositCache) {
      return this.depositCache[vaultId];
    }

    const commonOptionData = await this.getCommonOptionData(vaultId, state);
    if (!commonOptionData) {
      return null;
    }

    const { vault, zapTokens, zap, amm, lpTokens } = commonOptionData;

    this.depositCache[vault.id] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.getId(), vaultId, vault.chainId, tokenAddresses),
        type: 'zap',
        mode: TransactMode.Deposit,
        providerId: this.getId(),
        vaultId: vaultId,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        zap,
        amm,
        lpTokens,
        fee: 0,
      };
    });

    return this.depositCache[vault.id];
  }

  abstract getDepositQuoteForType(options: CommonDepositQuoteOptions): Promise<ZapQuote | null>;

  async getDepositQuoteFor(
    option: ZapOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<ZapQuote | null> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    if (!isStandardVault(vault)) {
      throw new Error(`Only standard vaults are supported`);
    }

    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const userTokenIn = userInput.token;
    const userAmountInWei = toWei(userInput.amount, userTokenIn.decimals);
    const swapTokenIn = nativeToWNative(userTokenIn, wnative);
    const swapTokenOut = option.lpTokens.find(
      token => token.address.toLowerCase() !== swapTokenIn.address.toLowerCase()
    );
    const chain = selectChainById(state, option.chainId);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const web3 = await getWeb3Instance(chain);
    const multicall = new MultiCall(web3, chain.multicallAddress);

    return this.getDepositQuoteForType({
      web3,
      depositToken,
      chain,
      option,
      swapTokenIn,
      amounts,
      multicall,
      swapTokenOut,
      userAmountInWei,
      vault,
      userInput,
    });
  }

  async getDepositStep(
    quote: ZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    const slippage = selectTransactSlippage(state);
    if (!swap || !isZapQuoteStepSwap(swap)) {
      throw new Error(`No swap step in zap quote`);
    }

    const input = quote.inputs[0];
    const isNativeInput = isTokenNative(input.token);

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.beefIn(vault, input.amount, isNativeInput, swap, option.zap, slippage),
      pending: false,
      extraInfo: { zap: true },
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    if (vaultId in this.withdrawCache) {
      return this.withdrawCache[vaultId];
    }

    const commonOptionData = await this.getCommonOptionData(vaultId, state);
    if (!commonOptionData) {
      return null;
    }

    const { vault, zap, amm, lpTokens, wnative, native } = commonOptionData;

    // beefy zap always swaps wrapped to native, so we only show the native option
    const withdrawTokens = tokensToZapWithdraw(lpTokens, wnative, native).map(
      token => token.address
    );
    const withdrawOptions: BeefyZapOption<AmmType>[] = [
      {
        id: createOptionId(this.getId(), vaultId, vault.chainId, withdrawTokens),
        type: 'zap',
        mode: TransactMode.Withdraw,
        providerId: this.getId(),
        vaultId: vaultId,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, withdrawTokens),
        tokenAddresses: withdrawTokens,
        zap,
        amm,
        lpTokens,
        fee: 0,
      },
    ];

    // beefy zap always swaps wrapped to native, so we only show the native option
    const zapTokens = tokensToZapWithdraw(commonOptionData.zapTokens, wnative, native);
    zapTokens.forEach(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      withdrawOptions.push({
        id: createOptionId(this.getId(), vaultId, vault.chainId, tokenAddresses),
        type: 'zap',
        mode: TransactMode.Withdraw,
        providerId: this.getId(),
        vaultId: vaultId,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        zap,
        amm,
        lpTokens,
        fee: 0,
      });
    });

    this.withdrawCache[vault.id] = withdrawOptions;

    return this.withdrawCache[vault.id];
  }

  async getWithdrawQuoteFor(
    option: ZapOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<ZapQuote | null> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    if (!isStandardVault(vault)) {
      throw new Error(`Only standard vaults are supported`);
    }

    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    // User inputs how much LP they want to withdraw, not how many shares (which the contract needs)
    const withdrawnToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenEqual(withdrawnToken, userInput.token)) {
      throw new Error(`Invalid input token ${userInput.token.symbol}`);
    }

    const chain = selectChainById(state, option.chainId);
    const web3 = await getWeb3Instance(chain);
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);

    const { shareToken, sharesToWithdrawWei, withdrawnAmountAfterFeeWei } =
      getVaultWithdrawnFromState(userInput, vault, state);

    let swapTokenIn = null;
    let swapTokenOut = null;
    let actualTokenOut = null;

    if (option.tokenAddresses.length === 1) {
      if (option.tokenAddresses[0].toLowerCase() === withdrawnToken.address.toLowerCase()) {
        throw new Error(`can not quote for deposit token on zap withdraw`);
      }

      const wantedTokenOut = selectTokenByAddress(state, option.chainId, option.tokenAddresses[0]);
      actualTokenOut = wnativeToNative(wantedTokenOut, wnative, native); // beefy zap always converts wnative to native

      swapTokenOut = nativeToWNative(wantedTokenOut, wnative);
      swapTokenIn = option.lpTokens.find(
        token => token.address.toLowerCase() !== swapTokenOut.address.toLowerCase()
      );
    }

    return this.getWithdrawQuoteForType({
      option,
      web3,
      multicall,
      chain,
      vault,
      amounts,
      shareToken,
      sharesToWithdrawWei,
      withdrawnToken,
      withdrawnAmountAfterFeeWei,
      swapTokenIn,
      swapTokenOut,
      actualTokenOut,
      wnative,
      native,
    });
  }

  abstract getWithdrawQuoteForType(
    options: CommonWithdrawQuoteOptions<AmmType>
  ): Promise<ZapQuote | null>;

  async getWithdrawStep(
    quote: ZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectStandardVaultById(state, option.vaultId);
    const swap = quote.steps.find(step => isZapQuoteStepSwap(step));
    const isSwap = swap && isZapQuoteStepSwap(swap);
    const slippage = selectTransactSlippage(state);

    return {
      step: isSwap ? 'zap-out' : 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: isSwap
        ? walletActions.beefOutAndSwap(vault, quote.inputs[0], swap, option.zap, slippage)
        : walletActions.beefOut(vault, quote.inputs[0], option.zap),
      pending: false,
      extraInfo: { zap: isSwap },
    };
  }

  isBeefyZapOption(option: ZapOption): option is BeefyZapOption<AmmType> {
    return option.providerId === this.getId();
  }
}
