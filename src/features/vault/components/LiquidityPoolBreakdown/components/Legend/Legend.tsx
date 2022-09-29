import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { CalculatedAsset } from '../../types';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { ChainEntity } from '../../../../../data/entities/chain';
import { formatPercent } from '../../../../../../helpers/format';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type LegendProps = {
  chainId: ChainEntity['id'];
  assets: CalculatedAsset[];
  className?: string;
};
export const Legend = memo<LegendProps>(function Legend({ chainId, assets, className }) {
  const classes = useStyles();

  const LegendItem = (asset: CalculatedAsset) => {
    return (
      <React.Fragment key={asset.address}>
        <div className={classes.item}>
          <div className={classes.key} style={{ backgroundColor: asset.color }} />
          <AssetsImage
            chainId={chainId}
            assetIds={asset.underlying ? asset.underlying.map(a => a.symbol) : [asset.symbol]}
            className={classes.icon}
          />
          {formatPercent(asset.percent)}
        </div>
        {asset.underlying?.map(LegendItem)}
      </React.Fragment>
    );
  };

  return <div className={clsx(classes.holder, className)}>{assets.map(LegendItem)}</div>;
});
