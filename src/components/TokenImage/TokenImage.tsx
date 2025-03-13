import { memo, useMemo } from 'react';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { useAppSelector } from '../../store.ts';
import {
  selectTokenByAddressOrUndefined,
  selectVaultTokenSymbols,
} from '../../features/data/selectors/tokens.ts';
import { AssetsImage, MissingAssetsImage } from '../AssetsImage/AssetsImage.tsx';
import type { AssetsImageProps } from '../AssetsImage/AssetsImage.tsx';
import { singleAssetExists } from '../../helpers/singleAssetSrc.ts';
import {
  selectNonGovVaultIdsByDepositTokenAddress,
  selectVaultByAddressOrUndefined,
} from '../../features/data/selectors/vaults.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { type CssStyles } from '@repo/styles/css';

type CommonTokenImageProps = {
  size?: AssetsImageProps['size'];
  css?: CssStyles;
};

type Token = Pick<TokenEntity, 'address' | 'symbol' | 'chainId'>;

export type TokenImageProps = {
  tokenAddress: TokenEntity['address'];
  chainId: ChainEntity['id'];
} & CommonTokenImageProps;

export const TokenImage = memo(function TokenImage({
  tokenAddress,
  chainId,
  size,
  css: cssProp,
}: TokenImageProps) {
  const token = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, chainId, tokenAddress)
  );

  return token ? (
    <TokenImageFromEntity token={token} size={size} css={cssProp} />
  ) : (
    <MissingAssetsImage css={cssProp} size={size} />
  );
});

export type TokenImageFromEntityProps = {
  token: Token;
} & CommonTokenImageProps;

export const TokenImageFromEntity = memo(function TokenImageFromEntity({
  token,
  size,
  css: cssProp,
}: TokenImageFromEntityProps) {
  const symbols = useMemo(
    () => (singleAssetExists(token.symbol, token.chainId) ? [token.symbol] : undefined),
    [token]
  );

  return symbols ? (
    <AssetsImage chainId={token.chainId} assetSymbols={symbols} css={cssProp} size={size} />
  ) : (
    <TokenNoSingleAsset token={token} size={size} css={cssProp} />
  );
});

export type TokensImageProps = {
  tokens: Token[];
} & CommonTokenImageProps;
export const TokensImage = memo(function TokensImage({
  tokens,
  size,
  css: cssProp,
}: TokensImageProps) {
  if (tokens.length === 1) {
    return (
      <TokenImage
        tokenAddress={tokens[0].address}
        chainId={tokens[0].chainId}
        css={cssProp}
        size={size}
      />
    );
  }

  return (
    <AssetsImage
      chainId={tokens[0].chainId}
      assetSymbols={tokens.map(token => token.symbol)}
      css={cssProp}
      size={size}
    />
  );
});

type TokenNoSingleAssetProps = {
  token: Token;
} & CommonTokenImageProps;
const TokenNoSingleAsset = memo(function TokenNoSingleAsset({
  token,
  size,
  css: cssProp,
}: TokenNoSingleAssetProps) {
  const vault = useAppSelector(state =>
    selectVaultByAddressOrUndefined(state, token.chainId, token.address)
  );
  if (vault) {
    return (
      <TokenImageViaVaultId vaultId={vault.id} chainId={vault.chainId} size={size} css={cssProp} />
    );
  }

  return <TokenNotVault token={token} size={size} css={cssProp} />;
});

type TokenNotVaultProps = {
  token: Token;
} & CommonTokenImageProps;
const TokenNotVault = memo(function TokenNotVault({
  token,
  size,
  css: cssProp,
}: TokenNotVaultProps) {
  const vaultIds = useAppSelector(state =>
    selectNonGovVaultIdsByDepositTokenAddress(state, token.chainId, token.address)
  );
  if (vaultIds && vaultIds.length > 0) {
    return (
      <TokenImageViaVaultId
        vaultId={vaultIds[0]}
        chainId={token.chainId}
        size={size}
        css={cssProp}
      />
    );
  }

  return <MissingAssetsImage css={cssProp} size={size} />;
});

type TokenImageViaVaultIdProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
} & CommonTokenImageProps;

const TokenImageViaVaultId = memo(function TokenImageViaVaultId({
  vaultId,
  chainId,
  size,
  css: cssProp,
}: TokenImageViaVaultIdProps) {
  const symbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
  return <AssetsImage chainId={chainId} assetSymbols={symbols} css={cssProp} size={size} />;
});
