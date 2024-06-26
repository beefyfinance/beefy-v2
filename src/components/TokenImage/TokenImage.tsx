import { memo, useMemo } from 'react';
import type { TokenEntity } from '../../features/data/entities/token';
import type { ChainEntity } from '../../features/data/entities/chain';
import { useAppSelector } from '../../store';
import {
  selectTokenByAddressOrUndefined,
  selectVaultTokenSymbols,
} from '../../features/data/selectors/tokens';
import { AssetsImage, type AssetsImageProps, MissingAssetsImage } from '../AssetsImage';
import { singleAssetExists } from '../../helpers/singleAssetSrc';
import {
  selectNonGovVaultIdsByDepositTokenAddress,
  selectVaultByAddressOrUndefined,
} from '../../features/data/selectors/vaults';
import type { VaultEntity } from '../../features/data/entities/vault';

type CommonTokenImageProps = {
  size?: AssetsImageProps['size'];
  className?: AssetsImageProps['className'];
};

type Token = Pick<TokenEntity, 'address' | 'symbol' | 'chainId'>;

export type TokenImageProps = {
  tokenAddress: TokenEntity['address'];
  chainId: ChainEntity['id'];
} & CommonTokenImageProps;

export const TokenImage = memo<TokenImageProps>(function TokenImage({
  tokenAddress,
  chainId,
  size,
  className,
}) {
  const token = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, chainId, tokenAddress)
  );

  return token ? (
    <TokenImageFromEntity token={token} size={size} className={className} />
  ) : (
    <MissingAssetsImage className={className} size={size} />
  );
});

export type TokenImageFromEntityProps = {
  token: Token;
} & CommonTokenImageProps;

export const TokenImageFromEntity = memo<TokenImageFromEntityProps>(function TokenImageFromEntity({
  token,
  size,
  className,
}) {
  const symbols = useMemo(
    () => (singleAssetExists(token.symbol, token.chainId) ? [token.symbol] : undefined),
    [token]
  );

  return symbols ? (
    <AssetsImage chainId={token.chainId} assetSymbols={symbols} className={className} size={size} />
  ) : (
    <TokenNoSingleAsset token={token} size={size} className={className} />
  );
});

export type TokensImageProps = {
  tokens: Token[];
} & CommonTokenImageProps;
export const TokensImage = memo<TokensImageProps>(function TokensImage({
  tokens,
  size,
  className,
}) {
  if (tokens.length === 1) {
    return (
      <TokenImage
        tokenAddress={tokens[0].address}
        chainId={tokens[0].chainId}
        className={className}
        size={size}
      />
    );
  }

  return (
    <AssetsImage
      chainId={tokens[0].chainId}
      assetSymbols={tokens.map(token => token.symbol)}
      className={className}
      size={size}
    />
  );
});

type TokenNoSingleAssetProps = {
  token: Token;
} & CommonTokenImageProps;
const TokenNoSingleAsset = memo<TokenNoSingleAssetProps>(function TokenNoSingleAsset({
  token,
  size,
  className,
}) {
  const vault = useAppSelector(state =>
    selectVaultByAddressOrUndefined(state, token.chainId, token.address)
  );
  if (vault) {
    return (
      <TokenImageViaVaultId
        vaultId={vault.id}
        chainId={vault.chainId}
        size={size}
        className={className}
      />
    );
  }

  return <TokenNotVault token={token} size={size} className={className} />;
});

type TokenNotVaultProps = {
  token: Token;
} & CommonTokenImageProps;
const TokenNotVault = memo<TokenNotVaultProps>(function TokenNotVault({ token, size, className }) {
  const vaultIds = useAppSelector(state =>
    selectNonGovVaultIdsByDepositTokenAddress(state, token.chainId, token.address)
  );
  if (vaultIds && vaultIds.length > 0) {
    return (
      <TokenImageViaVaultId
        vaultId={vaultIds[0]}
        chainId={token.chainId}
        size={size}
        className={className}
      />
    );
  }

  return <MissingAssetsImage className={className} size={size} />;
});

type TokenImageViaVaultIdProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
} & CommonTokenImageProps;

const TokenImageViaVaultId = memo<TokenImageViaVaultIdProps>(function TokenImageViaVaultId({
  vaultId,
  chainId,
  size,
  className,
}) {
  const symbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
  return <AssetsImage chainId={chainId} assetSymbols={symbols} className={className} size={size} />;
});
