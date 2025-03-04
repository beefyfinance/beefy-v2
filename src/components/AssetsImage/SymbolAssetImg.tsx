import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { memo, useMemo } from 'react';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc.ts';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';
import { AssetImg } from './AssetImg.tsx';

type SymbolAssetImgProps = {
  symbol: string;
  chainId?: ChainEntity['id'];
  className?: string;
};

export const SymbolAssetImg = memo<SymbolAssetImgProps>(function SymbolAssetImg({
  symbol,
  chainId,
  className,
}) {
  const src = useMemo(
    () => getSingleAssetSrc(symbol, chainId) ?? missingAssetUrl,
    [symbol, chainId]
  );

  return <AssetImg src={src} className={className} />;
});
