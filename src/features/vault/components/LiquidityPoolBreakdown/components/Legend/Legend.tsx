import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { memo, useMemo } from 'react';
import type { CalculatedAsset } from '../../types.ts';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { formatLargePercent } from '../../../../../../helpers/format.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type LegendProps = {
  chainId: ChainEntity['id'];
  assets: CalculatedAsset[];
  css?: CssStyles;
  isUnderlying?: boolean;
};
export const Legend = memo(function Legend({
  chainId,
  assets,
  css: cssProp,
  isUnderlying,
}: LegendProps) {
  const classes = useStyles();

  const percentKey = useMemo(
    () => (isUnderlying ? 'underlyingPercent' : 'percent'),

    [isUnderlying]
  );

  return (
    <div className={css(styles.holder, cssProp)}>
      {assets.map(asset => (
        <div key={asset.address} className={classes.item}>
          <div className={classes.key} style={{ backgroundColor: asset.color }} />
          <AssetsImage chainId={chainId} assetSymbols={[asset.symbol]} css={styles.icon} />
          {formatLargePercent(asset[percentKey])}
        </div>
      ))}
    </div>
  );
});
