import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
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

  return (
    <div className={clsx(classes.holder, className)}>
      {assets.map(asset => (
        <div key={asset.address} className={classes.item}>
          <div className={classes.key} style={{ backgroundColor: asset.color }} />
          <AssetsImage chainId={chainId} assetIds={[asset.symbol]} className={classes.icon} />
          {formatPercent(asset.percent)}
        </div>
      ))}
    </div>
  );
});
