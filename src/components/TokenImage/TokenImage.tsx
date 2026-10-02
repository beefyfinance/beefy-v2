import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { createCachedSelector } from 're-reselect';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectTokenByAddressOrUndefined,
  selectVaultImageAssets,
  selectVaultTokenImageAssets,
} from '../../features/data/selectors/tokens.ts';
import {
  selectNonGovVaultIdsByDepositTokenAddress,
  selectVaultByAddressOrUndefined,
  selectVaultById,
} from '../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import {
  areSameSingleAssets,
  type SingleAsset,
  singleAssetExists,
} from '../../helpers/singleAssetSrc.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import type { AssetsImageProps } from '../AssetsImage/AssetsImage.tsx';
import {
  AssetsImage,
  AssetsImageWithChain,
  MissingAssetsImage,
} from '../AssetsImage/AssetsImage.tsx';

type AddressChainIdOptions = {
  address: TokenEntity['address'];
  chainId: ChainEntity['id'];
};

type TokenOptions = {
  token: Token;
};

type TokensOptions = {
  tokens: Token[];
};

type VaultIdOptions = {
  vaultId: VaultEntity['id'];
  assetsOnly?: boolean;
};

type VaultOptions = {
  vault: VaultEntity;
  assetsOnly?: boolean;
};

const selectTokenAsAssets = createCachedSelector(
  (_state: BeefyState, token: Token) => token.id,
  (_state: BeefyState, token: Token) => token.symbol,
  (_state: BeefyState, token: Token) => token.chainId,
  (id, symbol, chainId): SingleAsset[] => [{ id, symbol, chainId }]
)((_state: BeefyState, { id, symbol, chainId }: Token) => `${chainId}-${id ?? ''}-${symbol}`);

const selectAssetsForAddressChainId = (
  state: BeefyState,
  { address, chainId }: AddressChainIdOptions
): SingleAsset[] | undefined => {
  // check vaults first, as not all vaults have a share token
  const vault = selectVaultByAddressOrUndefined(state, chainId, address);
  if (vault) {
    return selectAssetsForVault(state, { vault });
  }

  // if valid token, forward to token selector
  const token = selectTokenByAddressOrUndefined(state, chainId, address);
  if (token) {
    return selectAssetsForToken(state, { token });
  }

  return undefined;
};

const selectAssetsForToken = (
  state: BeefyState,
  { token }: TokenOptions
): SingleAsset[] | undefined => {
  // vault share token -> use vault icon
  const vault = selectVaultByAddressOrUndefined(state, token.chainId, token.address);
  if (vault) {
    return selectAssetsForVault(state, { vault });
  }

  // image exists for token -> use single asset icon
  if (singleAssetExists(token)) {
    return selectTokenAsAssets(state, token);
  }

  // LP token for a vault -> use vault icon
  const depositForVaultIds = selectNonGovVaultIdsByDepositTokenAddress(
    state,
    token.chainId,
    token.address
  );
  if (depositForVaultIds?.length) {
    return selectAssetsForVaultId(state, { vaultId: depositForVaultIds[0], assetsOnly: true });
  }

  return undefined;
};

const selectAssetsForTokens = (
  state: BeefyState,
  { tokens }: TokensOptions
): SingleAsset[] | undefined => {
  if (tokens.length === 0) {
    return undefined;
  }

  if (tokens.length === 1) {
    return selectAssetsForToken(state, { token: tokens[0] });
  }

  return tokens;
};

const selectAssetsForVaultId = (
  state: BeefyState,
  { vaultId, ...rest }: VaultIdOptions
): SingleAsset[] | undefined => {
  return selectAssetsForVault(state, { vault: selectVaultById(state, vaultId), ...rest });
};

const selectAssetsForVault = (
  state: BeefyState,
  { vault, assetsOnly = false }: VaultOptions
): SingleAsset[] | undefined => {
  const assets =
    assetsOnly ?
      selectVaultTokenImageAssets(state, vault.id)
    : selectVaultImageAssets(state, vault.id);
  return assets.length ? assets : undefined;
};

type CommonTokenImageProps = {
  size?: AssetsImageProps['size'];
  css?: CssStyles;
};

type Token = Pick<TokenEntity, 'address'> & SingleAsset;

export type TokenImageProps = AddressChainIdOptions & CommonTokenImageProps;
export const TokenImage = memo(function TokenImage({
  size,
  css: cssProp,
  ...options
}: TokenImageProps) {
  const assets = useAppSelector(state => selectAssetsForAddressChainId(state, options));

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type TokenImageFromEntityProps = TokenOptions & CommonTokenImageProps;
export const TokenImageFromEntity = memo(function TokenImageFromEntity({
  size,
  css: cssProp,
  ...options
}: TokenImageFromEntityProps) {
  const assets = useAppSelector(state => selectAssetsForToken(state, options));

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type TokensImageProps = TokensOptions & CommonTokenImageProps;
export const TokensImage = memo(function TokensImage({
  size,
  css: cssProp,
  ...options
}: TokensImageProps) {
  const assets = useAppSelector(
    state => selectAssetsForTokens(state, options),
    areSameSingleAssets
  );

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type TokensImageWithChainProps = TokensOptions &
  CommonTokenImageProps & { chainId: ChainEntity['id'] };
export const TokensImageWithChain = memo(function TokensImageWithChain({
  size,
  css: cssProp,
  chainId,
  ...options
}: TokensImageWithChainProps) {
  const assets = useAppSelector(
    state => selectAssetsForTokens(state, options),
    areSameSingleAssets
  );

  return assets ?
      <AssetsImageWithChain chainId={chainId} assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type VaultIdImageProps = VaultIdOptions & CommonTokenImageProps;
export const VaultIdImage = memo(function VaultIdImage({
  size,
  css: cssProp,
  ...options
}: VaultIdImageProps) {
  const assets = useAppSelector(state => selectAssetsForVaultId(state, options));

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type VaultImageProps = VaultOptions & CommonTokenImageProps;
export const VaultImage = memo(function VaultImage({
  size,
  css: cssProp,
  ...options
}: VaultImageProps) {
  const assets = useAppSelector(state => selectAssetsForVault(state, options));

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});

export type VaultDepositTokenImageProps = Omit<VaultOptions, 'assetsOnly'> & CommonTokenImageProps;
export const VaultDepositTokenImage = memo(function VaultDepositTokenImage({
  size,
  css: cssProp,
  ...options
}: VaultImageProps) {
  const assets = useAppSelector(state =>
    selectAssetsForVault(state, { ...options, assetsOnly: true })
  );

  return assets ?
      <AssetsImage assets={assets} css={cssProp} size={size} />
    : <MissingAssetsImage css={cssProp} size={size} />;
});
