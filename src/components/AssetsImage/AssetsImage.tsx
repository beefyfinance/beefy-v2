import { memo, type ReactNode, useMemo } from 'react';
import { DEFAULT_SIZE, styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetSrc } from '../../helpers/singleAssetSrc';
import clsx from 'clsx';
import type { ChainEntity } from '../../features/data/entities/chain';
import missingAssetUrl from '../../images/single-assets/missing-asset.svg';

const useStyles = makeStyles(styles);
const maxSupportedAssets = 8;

type CommonProps = {
  size?: number;
  className?: string;
};

export type AssetsImageProps = {
  chainId?: ChainEntity['id'] | undefined;
  assetSymbols?: string[] | undefined;
} & CommonProps;

export const AssetsImage = memo<AssetsImageProps>(function AssetsImage({
  chainId,
  assetSymbols,
  className,
  size = DEFAULT_SIZE,
}) {
  if (!assetSymbols || assetSymbols.length === 0) {
    return <MissingAssetsImage size={size} className={className} />;
  }

  return (
    <Icon
      count={Math.min(assetSymbols.length, maxSupportedAssets)}
      size={size}
      className={className}
    >
      {assetSymbols.slice(0, maxSupportedAssets).map(symbol => (
        <Asset key={`${symbol}.${chainId}`} symbol={symbol} chainId={chainId} size={size} />
      ))}
    </Icon>
  );
});

export type MissingAssetsImageProps = CommonProps;

export const MissingAssetsImage = memo<MissingAssetsImageProps>(function MissingAssetsImage({
  size,
  className,
}) {
  const classes = useStyles();
  return (
    <Icon className={className} size={size} count={1}>
      <img
        src={missingAssetUrl}
        alt=""
        role="presentation"
        className={clsx(classes.iconImg, className)}
        width={size || DEFAULT_SIZE}
        height={size || DEFAULT_SIZE}
      />
    </Icon>
  );
});

type AssetProps = {
  symbol: string;
  chainId?: ChainEntity['id'];
} & CommonProps;

const Asset = memo<AssetProps>(function Icon({ symbol, chainId, size, className }) {
  const classes = useStyles();
  const src = useMemo(
    () => getSingleAssetSrc(symbol, chainId) ?? missingAssetUrl,
    [symbol, chainId]
  );

  return (
    <img
      src={src}
      alt=""
      role="presentation"
      className={clsx(classes.iconImg, className)}
      width={size || DEFAULT_SIZE}
      height={size || DEFAULT_SIZE}
    />
  );
});

type IconProps = {
  count: number;
  children: ReactNode;
} & CommonProps;

const Icon = memo<IconProps>(function Icon({ children, count, size, className }) {
  const classes = useStyles();
  const style = useMemo(
    () => (size && size !== DEFAULT_SIZE ? { width: size, height: size } : undefined),
    [size]
  );

  return (
    <div className={clsx(classes.icon, className)} data-count={count} style={style}>
      {children}
    </div>
  );
});
