import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import type { CalculatedAsset } from '../../types';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { formatLargePercent } from '../../../../../../helpers/format';
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

  return (
    <div className={clsx(classes.holder, className)}>
      {assets.map(asset => (
        <div key={asset.address} className={classes.item}>
          <div className={classes.key} style={{ backgroundColor: asset.color }} />
          <AssetsImage chainId={chainId} assetSymbols={[asset.symbol]} className={classes.icon} />
          {formatLargePercent(asset.percent)}
        </div>
      ))}
    </div>
  );
});
