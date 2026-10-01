import { getSingleAssetSrc } from '../../../helpers/singleAssetSrc.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type AddToWalletParams = {
  chainId: ChainEntity['id'];
  tokenAddress: TokenEntity['address'];
  customIconUrl?: string;
};

export type AddTokenToWalletPayload = {
  token: TokenEntity;
  iconUrl: string;
};

function getTokenIconUrl(token: TokenEntity, customUrl?: string): string {
  if (customUrl) {
    return customUrl;
  }

  const assetSrc = getSingleAssetSrc(token);
  if (assetSrc) {
    return `${window.location.origin}${assetSrc}`;
  }

  return '';
}

export const addTokenToWalletAction = createAppAsyncThunk<
  AddTokenToWalletPayload,
  AddToWalletParams
>('addToWallet/open', async ({ chainId, tokenAddress, customIconUrl }, { getState }) => {
  const state = getState();
  const token = selectTokenByAddress(state, chainId, tokenAddress);
  const iconUrl = getTokenIconUrl(token, customIconUrl);

  return {
    token,
    iconUrl,
  };
});
