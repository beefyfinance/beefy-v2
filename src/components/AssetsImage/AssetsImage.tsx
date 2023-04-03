import * as React from 'react';
import { memo, useMemo } from 'react';
import { DEFAULT_SIZE, styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetLoader } from '../../helpers/singleAssetSrc';
import clsx from 'clsx';
import { ChainEntity } from '../../features/data/entities/chain';
import { AssetImg } from './AssetImg';

const useStyles = makeStyles(styles);
const maxSupportedAssets = 8;

function useAssetsImageLoaders(chainId: ChainEntity['id'], assetIds: string[]) {
  return useMemo(() => {
    return assetIds.slice(0, maxSupportedAssets).map(assetId => ({
      key: `${chainId}-${assetId}`,
      loader: getSingleAssetLoader(assetId, chainId),
    }));
  }, [assetIds, chainId]);
}

export type AssetsImageType = {
  chainId: ChainEntity['id'];
  assetIds: string[];
  size?: number;
  className?: string;
};
export const AssetsImage = memo<AssetsImageType>(function AssetsImage({
  chainId,
  assetIds,
  className,
  size = DEFAULT_SIZE,
}) {
  const classes = useStyles();
  const loaders = useAssetsImageLoaders(chainId, assetIds);

  return (
    <div
      className={clsx(classes.icon, className)}
      data-count={loaders.length}
      style={size !== DEFAULT_SIZE ? { width: size, height: size } : undefined}
    >
      {loaders.map(({ key, loader }, i) =>
        loader ? (
          <AssetImg
            loader={loader}
            key={key}
            alt=""
            role="presentation"
            className={classes.iconImg}
            width={size}
            height={size}
          />
        ) : (
          <div
            key={i}
            className={clsx(classes.iconImg, classes.placeholder, classes.placeholderError)}
          />
        )
      )}
    </div>
  );
});
