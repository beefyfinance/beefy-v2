import * as React from 'react';
import { memo, useMemo } from 'react';
import { DEFAULT_SIZE, styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';
import clsx from 'clsx';
import { ChainEntity } from '../../features/data/entities/chain';

const useStyles = makeStyles(styles);

export type AssetsImageType = {
  chainId: ChainEntity['id'];
  assetIds: string[];
  imageUri?: string;
  size?: number;
  className?: string;
};
export const AssetsImage = memo<AssetsImageType>(function AssetsImage({
  chainId,
  assetIds,
  imageUri,
  className,
  size = DEFAULT_SIZE,
}) {
  const classes = useStyles();
  const maxSupportedAssets = 8;
  const uris = useMemo(() => {
    if (imageUri) {
      return [require(`../../images/${imageUri}`).default];
    }

    return assetIds
      .slice(0, maxSupportedAssets)
      .map(assetId => getSingleAssetSrc(assetId, chainId));
  }, [imageUri, assetIds, chainId]);

  return (
    <div
      className={clsx(classes.icon, className)}
      data-count={uris.length}
      style={size !== DEFAULT_SIZE ? { width: size, height: size } : undefined}
    >
      {uris.map(uri =>
        uri ? (
          <img
            src={uri}
            key={uri}
            alt=""
            role="presentation"
            className={classes.iconImg}
            width={size}
            height={size}
          />
        ) : (
          <div className={clsx(classes.iconImg, classes.iconImgPlaceholder)} />
        )
      )}
    </div>
  );
});
