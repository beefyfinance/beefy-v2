import { memo } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';
import { AssetArrangement } from './AssetArrangement.tsx';
import { AssetImg } from './AssetImg.tsx';
import { SymbolAssetImg } from './SymbolAssetImg.tsx';
import { defaultSize, maxSupportedAssets } from './config.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { ChainIcon } from '../ChainIcon/ChainIcon.tsx';

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

const chainBadgeSize = 0.5;

export const AssetsImageWithChain = memo<AssetsImageProps>(function AssetsImageWithChain({
  chainId,
  assetSymbols,
  css: cssProp,
  size = defaultSize,
}) {
  const badgeSize = Math.round(size * chainBadgeSize);

  return (
    <div className={css(wrapperStyle, cssProp)} style={{ width: size, height: size }}>
      <AssetsImage chainId={chainId} assetSymbols={[...assetSymbols]} size={size} />
      {chainId && <ChainIcon chainId={chainId} size={badgeSize} css={chainBadgeStyle} />}
    </div>
  );
});

const wrapperStyle = css.raw({
  position: 'relative',
  display: 'inline-block',
  flexShrink: 0,
});

const chainBadgeStyle = css.raw({
  position: 'absolute',
  right: '-2px',
  bottom: '-2px',
});
