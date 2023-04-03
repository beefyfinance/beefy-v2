import * as React from 'react';
import { memo, useMemo } from 'react';
import { DEFAULT_SIZE, styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';
import clsx from 'clsx';
import { ChainEntity } from '../../features/data/entities/chain';

const useStyles = makeStyles(styles);
const maxSupportedAssets = 8;

function useAssetsImageUris(chainId: ChainEntity['id'], assetIds: string[]) {
  return useMemo(() => {
    return assetIds
      .slice(0, maxSupportedAssets)
      .map(assetId => getSingleAssetSrc(assetId, chainId));
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
  const uris = useAssetsImageUris(chainId, assetIds);

  return (
    <div
      className={clsx(classes.icon, className)}
      data-count={uris.length}
      style={size !== DEFAULT_SIZE ? { width: size, height: size } : undefined}
    >
      {uris.map((uri, i) =>
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
          <div key={i} className={clsx(classes.iconImg, classes.iconImgPlaceholder)} />
        )
      )}
    </div>
  );
});
