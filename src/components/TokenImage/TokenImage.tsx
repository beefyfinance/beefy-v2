import { memo, useMemo } from 'react';
import { TokenEntity } from '../../features/data/entities/token';
import { ChainEntity } from '../../features/data/entities/chain';
import { useAppSelector } from '../../store';
import { selectTokenByAddressOrNull } from '../../features/data/selectors/tokens';
import { AssetsImage, AssetsImageType } from '../AssetsImage';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';
import { selectFirstStandardVaultByDepositTokenAddress } from '../../features/data/selectors/vaults';

export type TokenImageProps = {
  tokenAddress: TokenEntity['address'];
  chainId: ChainEntity['id'];
  size?: AssetsImageType['size'];
  className?: AssetsImageType['className'];
};
export const TokenImage = memo<TokenImageProps>(function ({
  tokenAddress,
  chainId,
  size,
  className,
}) {
  const token = useAppSelector(state => selectTokenByAddressOrNull(state, chainId, tokenAddress));
  const haveAssetForToken = useMemo(() => {
    return token && !!getSingleAssetSrc(token.id, token.chainId);
  }, [token]);

  return haveAssetForToken ? (
    <AssetsImage chainId={chainId} assetIds={[token.id]} className={className} size={size} />
  ) : token ? (
    <TokenWithoutAsset token={token} size={size} className={className} />
  ) : (
    <AssetsImage chainId={chainId} assetIds={['unknown']} className={className} size={size} />
  );
});

type TokenWithoutAssetProps = {
  token: TokenEntity;
} & Pick<TokenImageProps, 'size' | 'className'>;
const TokenWithoutAsset = memo<TokenWithoutAssetProps>(function ({ token, size, className }) {
  // The assets of a LP are defined on the vault config for a vault with that deposit token
  const vault = useAppSelector(state =>
    selectFirstStandardVaultByDepositTokenAddress(state, token.chainId, token.address)
  );

  return vault ? (
    <AssetsImage
      chainId={token.chainId}
      assetIds={vault.assetIds}
      className={className}
      size={size}
    />
  ) : (
    <AssetsImage chainId={token.chainId} assetIds={[token.id]} className={className} size={size} />
  );
});

export type TokensImageProps = {
  tokens: TokenEntity[];
  size?: AssetsImageType['size'];
  className?: AssetsImageType['className'];
};
export const TokensImage = memo<TokensImageProps>(function ({ tokens, size, className }) {
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
      assetIds={tokens.map(token => token.id)}
      className={className}
      size={size}
    />
  );
});
