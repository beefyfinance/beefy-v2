import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { keys } from '../../../../../../helpers/object.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import {
  selectTreasuryAssetsByChainId,
  selectTreasuryHoldingsByMMId,
} from '../../../../../data/selectors/treasury.ts';
import { AssetInfo, AssetInfoMM } from '../AssetInfo/AssetInfo.tsx';
import { useSortedAssets, useSortedMMHoldings } from './hooks.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type AssetsProps = {
  chainId: ChainEntity['id'];
};

const chainAssetTypes = {
  liquid: 'Liquid Assets',
  staked: 'Staked Assets',
  locked: 'Locked Assets',
};

export const Assets = memo(function Assets({ chainId }: AssetsProps) {
  const { t } = useTranslation();

  const assets = useAppSelector(state => selectTreasuryAssetsByChainId(state, chainId));

  const sortedAssets = useSortedAssets(assets);
  const classes = useStyles();

  return (
    <div className={classes.assetsContainer}>
      {keys(chainAssetTypes).map(
        assetType =>
          sortedAssets[assetType] &&
          sortedAssets[assetType].length > 0 && (
            <Fragment key={assetType}>
              <div className={classes.assetTypes}>{t(chainAssetTypes[assetType])}</div>
              {sortedAssets[assetType].map(token => {
                return <AssetInfo key={token.address} chainId={chainId} token={token} />;
              })}
            </Fragment>
          )
      )}
    </div>
  );
});

export type MMAssetsProps = {
  mmId: string;
};

export const MMAssets = memo(function MMAssets({ mmId }: MMAssetsProps) {
  const mmHoldings = useAppSelector(state => selectTreasuryHoldingsByMMId(state, mmId));
  const sortedAssetsByExchange = useSortedMMHoldings(mmHoldings);

  const classes = useStyles();

  return (
    <div className={classes.assetsContainer}>
      {Object.keys(sortedAssetsByExchange).map(
        exchangeId =>
          sortedAssetsByExchange[exchangeId].length > 0 && (
            <Fragment key={exchangeId}>
              <div className={classes.assetTypes}>{exchangeId.toUpperCase()}</div>
              {sortedAssetsByExchange[exchangeId].map((token, index) => {
                return <AssetInfoMM key={token.symbol + index} holding={token} />;
              })}
            </Fragment>
          )
      )}
    </div>
  );
});
