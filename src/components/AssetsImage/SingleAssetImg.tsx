import { memo } from 'react';
import {
  getSingleAssetSrc,
  isSameSingleAsset,
  type SingleAsset,
} from '../../helpers/singleAssetSrc.ts';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';
import { AssetImg } from './AssetImg.tsx';

type SingleAssetImgProps = {
  asset: SingleAsset;
};

export const SingleAssetImg = memo<SingleAssetImgProps>(
  function SingleAssetImg({ asset }) {
    return <AssetImg src={getSingleAssetSrc(asset) ?? missingAssetUrl} />;
  },
  (prevProps, nextProps) => isSameSingleAsset(prevProps.asset, nextProps.asset)
);
