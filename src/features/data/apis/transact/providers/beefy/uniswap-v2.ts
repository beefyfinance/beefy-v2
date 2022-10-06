import { isStandardVault, VaultEntity } from '../../../../entities/vault';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../selectors/vaults';
import { logger } from '../../../../utils/logger';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../../../../selectors/tokens';
import {
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
  TokenNative,
} from '../../../../entities/token';
import { sortBy } from 'lodash';
import { computeUniswapV2PairAddress } from '../../../zap/uniswap-v2';
import { ZapEntity } from '../../../../entities/zap';
import { TransactMode } from '../../../../reducers/wallet/transact';
import BigNumber from 'bignumber.js';
import { ITransactProvider, ZapOption, ZapQuote } from '../../transact-types';
import { createOptionId, createTokensId } from '../../utils';

type BeefyUniswapV2ZapOption = {
  zap: ZapEntity;
  lpTokens: TokenEntity[];
} & ZapOption;

/**
 * Deposit/withdraw to UniswapV2-type vaults via Beefy Zap Contracts
 */
export class BeefyUniswapV2ZapProvider implements ITransactProvider {
  public readonly id: string = 'beefy-uniswap-v2';
  private cache: Record<string, BeefyUniswapV2ZapOption[]> = {};

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<ZapOption[] | null> {
    if (vaultId in this.cache) {
      return this.cache[vaultId];
    }

    const vault = selectVaultById(state, vaultId);

    let zaps = state.entities.zaps.byChainId[vault.chainId];
    if (zaps === undefined || zaps.length === 0) {
      logger.log(
        this.id,
        `no zaps for ${vault.chainId}`,
        state.entities.zaps.byChainId[vault.chainId]
      );
      return null;
    }

    zaps = zaps.filter(zap => zap.type === 'uniswapv2');
    if (zaps === undefined || zaps.length === 0) {
      logger.log(this.id, `no uniswapv2 zaps for ${vault.chainId}`);
      return null;
    }

    if (!isStandardVault(vault)) {
      logger.log(this.id, `${vaultId} only standard vaults supported`);
      return null;
    }

    if (vault.assetIds.length !== 2) {
      logger.log(this.id, `only supports uniswap v2-like 2 asset lp vaults`);
      return null;
    }

    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        logger.warn(this.id, `${vault.assetIds[i]} not loaded`);
        return null;
      }
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      logger.log(this.id, `zap to non-erc20 not supported`);
      return null;
    }

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const native = selectChainNativeToken(state, vault.chainId);
    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    const lpTokens = tokensToLp(tokens, wnative);

    const zap = zaps.find(
      zap =>
        depositToken.address ===
        computeUniswapV2PairAddress(
          zap.ammFactory,
          zap.ammPairInitHash,
          lpTokens[0].address,
          lpTokens[1].address
        )
    );
    if (zap === undefined) {
      logger.log(this.id, `no amm has lp ${depositToken.address}`);
      return null;
    }

    const zapTokens = tokensToZap(tokens, wnative, native);

    this.cache[vault.id] = zapTokens.map(token => {
      const tokenAddresses = [token].map(token => token.address.toLowerCase());

      return {
        id: createOptionId(this.id, vaultId, vault.chainId, tokenAddresses),
        type: 'zap',
        mode: TransactMode.Deposit,
        providerId: this.id,
        vaultId: vaultId,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses: tokenAddresses,
        zap,
        lpTokens,
      };
    });

    return this.cache[vault.id];
  }

  async getDepositQuoteFor(option: ZapOption, amount: BigNumber): Promise<ZapQuote | null> {
    return null;
  }

  async getWithdrawOptionsFor(vaultId: VaultEntity['id'], state: BeefyState): Promise<void | null> {
    return null;
  }
}

function tokensToLp(tokens: TokenEntity[], wnative: TokenErc20): TokenEntity[] {
  return orderTokens(
    tokens.map(token =>
      isTokenNative(token) ? (token.address === 'native' ? wnative : token) : token
    )
  );
}

function tokensToZap(
  tokens: TokenEntity[],
  wnative: TokenErc20,
  native: TokenNative
): TokenEntity[] {
  const hasNative = tokens.find(token => token.address === native.address);
  const hasWrappedNative = tokens.find(token => token.address === wnative.address);

  if (hasWrappedNative && !hasNative) {
    tokens.unshift(native);
  }

  if (hasNative && !hasWrappedNative) {
    tokens.unshift(wnative);
  }

  return tokens;
}

function orderTokens(tokens: TokenEntity[]): TokenEntity[] {
  return sortBy(tokens, token => token.address.toLowerCase());
}
