import { memo } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';
import { AssetArrangement } from './AssetArrangement.tsx';
import { AssetImg } from './AssetImg.tsx';
import { SingleAssetImg } from './SingleAssetImg.tsx';
import { defaultSize, maxSupportedAssets } from './config.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { ChainIcon } from '../ChainIcon/ChainIcon.tsx';
import { areSameSingleAssets, type SingleAsset } from '../../helpers/singleAssetSrc.ts';

const chainBadgeSize = 0.5;

type CommonProps = {
  size?: number;
  css?: CssStyles;
};

export type AssetsImageProps = {
  assets: SingleAsset[];
} & CommonProps;

export const AssetsImage = memo<AssetsImageProps>(
  function AssetsImage({ assets, css, size = defaultSize }) {
    if (assets.length === 0) {
      return <MissingAssetsImage size={size} css={css} />;
    }

    return (
      <AssetArrangement count={Math.min(assets.length, maxSupportedAssets)} size={size} css={css}>
        {assets.slice(0, maxSupportedAssets).map((asset, index) => (
          <SingleAssetImg key={index} asset={asset} />
        ))}
      </AssetArrangement>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.size === nextProps.size &&
      prevProps.css === nextProps.css &&
      areSameSingleAssets(prevProps.assets, nextProps.assets)
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

export type AssetsImageWithChainProps = {
  chainId?: ChainEntity['id'];
  assets: SingleAsset[];
} & CommonProps;

export const AssetsImageWithChain = memo<AssetsImageWithChainProps>(function AssetsImageWithChain({
  chainId,
  assets,
  css: cssProp,
  size = defaultSize,
}) {
  const badgeSize = Math.round(size * chainBadgeSize);

  return (
    <div className={css(wrapperStyle, cssProp)} style={{ width: size, height: size }}>
      <AssetsImage assets={assets} size={size} />
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
  bottom: '0',
  right: '0',
  transform: 'translate(50%, 0)',
});
