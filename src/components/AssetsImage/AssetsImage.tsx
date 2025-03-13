import { memo } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';
import { AssetArrangement } from './AssetArrangement.tsx';
import { AssetImg } from './AssetImg.tsx';
import { SymbolAssetImg } from './SymbolAssetImg.tsx';
import { defaultSize, maxSupportedAssets } from './config.ts';
import type { CssStyles } from '@repo/styles/css';

type CommonProps = {
  size?: number;
  css?: CssStyles;
};

export type AssetsImageProps = {
  chainId?: ChainEntity['id'] | undefined;
  assetSymbols: string[];
} & CommonProps;

export const AssetsImage = memo<AssetsImageProps>(
  function AssetsImage({ chainId, assetSymbols, css, size = defaultSize }) {
    if (!assetSymbols || assetSymbols.length === 0) {
      return <MissingAssetsImage size={size} css={css} />;
    }

    return (
      <AssetArrangement
        count={Math.min(assetSymbols.length, maxSupportedAssets)}
        size={size}
        css={css}
      >
        {assetSymbols.slice(0, maxSupportedAssets).map(symbol => (
          <SymbolAssetImg key={`${symbol}.${chainId}`} symbol={symbol} chainId={chainId} />
        ))}
      </AssetArrangement>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.chainId === nextProps.chainId &&
      prevProps.size === nextProps.size &&
      prevProps.css === nextProps.css &&
      prevProps.assetSymbols?.join() === nextProps.assetSymbols?.join()
    );
  }
);

export type MissingAssetsImageProps = CommonProps;

export const MissingAssetsImage = memo<MissingAssetsImageProps>(function MissingAssetsImage({
  size,
  css,
}) {
  return (
    <AssetArrangement css={css} size={size} count={1}>
      <AssetImg src={missingAssetUrl} />
    </AssetArrangement>
  );
});
