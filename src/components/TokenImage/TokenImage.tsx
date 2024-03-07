import { memo, useMemo } from 'react';
import type { TokenEntity } from '../../features/data/entities/token';
import type { ChainEntity } from '../../features/data/entities/chain';
import { useAppSelector } from '../../store';
import {
  selectTokenByAddressOrUndefined,
  selectVaultTokenSymbols,
} from '../../features/data/selectors/tokens';
import type { AssetsImageType } from '../AssetsImage';
import { AssetsImage } from '../AssetsImage';
import { singleAssetExists } from '../../helpers/singleAssetSrc';
import { selectFirstStandardVaultByDepositTokenAddress } from '../../features/data/selectors/vaults';

export type TokenImageProps = {
  tokenAddress: TokenEntity['address'];
  chainId: ChainEntity['id'];
  size?: AssetsImageType['size'];
  className?: AssetsImageType['className'];
};
export const TokenImage = memo<TokenImageProps>(function TokenImage({
  tokenAddress,
  chainId,
  size,
  className,
}) {
  const token = useAppSelector(state =>
    selectTokenByAddressOrUndefined(state, chainId, tokenAddress)
  );
  const haveAssetForToken = useMemo(() => {
    return !!token && singleAssetExists(token.symbol, token.chainId);
  }, [token]);

  return haveAssetForToken ? (
    <AssetsImage
      chainId={chainId}
      assetSymbols={[token!.symbol]}
      className={className}
      size={size}
    />
  ) : token ? (
    <TokenWithoutAsset token={token} size={size} className={className} />
  ) : (
    <AssetsImage chainId={chainId} assetSymbols={['unknown']} className={className} size={size} />
  );
});

type TokenWithoutAssetProps = {
  token: TokenEntity;
} & Pick<TokenImageProps, 'size' | 'className'>;
const TokenWithoutAsset = memo<TokenWithoutAssetProps>(function TokenWithoutAsset({
  token,
  size,
  className,
}) {
  // The assets of a LP are defined on the vault config for a vault with that deposit token
  const vault = useAppSelector(state =>
    selectFirstStandardVaultByDepositTokenAddress(state, token.chainId, token.address)
  );
  const vaultTokenSymbols = useAppSelector(state =>
    vault ? selectVaultTokenSymbols(state, vault.id) : []
  );

  return vault && vaultTokenSymbols.length ? (
    <AssetsImage
      chainId={token.chainId}
      assetSymbols={vaultTokenSymbols}
      className={className}
      size={size}
    />
  ) : (
    <AssetsImage
      chainId={token.chainId}
      assetSymbols={[token.id]}
      className={className}
      size={size}
    />
  );
});

export type TokensImageProps = {
  tokens: TokenEntity[];
  size?: AssetsImageType['size'];
  className?: AssetsImageType['className'];
};
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
      assetSymbols={tokens.map(token => token.id)}
      className={className}
      size={size}
    />
  );
});
