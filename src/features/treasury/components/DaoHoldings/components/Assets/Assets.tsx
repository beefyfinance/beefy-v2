import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import type { ChainEntity } from '../../../../../data/entities/chain';
import {
  selectTreasuryAssetsByChainId,
  selectTreasuryHoldingsByMMId,
} from '../../../../../data/selectors/treasury';
import { AssetInfo, AssetInfoMM } from '../AssetInfo';
import { useSortedAssets, useSortedMMHoldings } from './hooks';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type AssetsProps = {
  chainId: ChainEntity['id'];
};

const chainAssetTypes: Record<string, string> = {
  liquid: 'Liquid Assets',
  staked: 'Staked Assets',
  locked: 'Locked Assets',
};

export const Assets = memo<AssetsProps>(function Assets({ chainId }) {
  const { t } = useTranslation();

  const assets = useAppSelector(state => selectTreasuryAssetsByChainId(state, chainId));

  const sortedAssets = useSortedAssets(assets);
  const classes = useStyles();

  return (
    <div className={classes.assetsContainer}>
      {Object.keys(chainAssetTypes).map(
        assetType =>
          sortedAssets[assetType].length > 0 && (
            <React.Fragment key={assetType}>
              <div className={classes.assetTypes}>{t(chainAssetTypes[assetType])}</div>
              {sortedAssets[assetType].map(token => {
                return <AssetInfo key={token.address} chainId={chainId} token={token} />;
              })}
            </React.Fragment>
          )
      )}
    </div>
  );
});

export type MMAssetsProps = { mmId: string };

export const MMAssets = memo<MMAssetsProps>(function MMAssets({ mmId }) {
  const mmHoldings = useAppSelector(state => selectTreasuryHoldingsByMMId(state, mmId));
  const sortedAssetsByExchange = useSortedMMHoldings(mmHoldings);

  const classes = useStyles();

  return (
    <div className={classes.assetsContainer}>
      {Object.keys(sortedAssetsByExchange).map(
        exchangeId =>
          sortedAssetsByExchange[exchangeId].length > 0 && (
            <React.Fragment key={exchangeId}>
              <div className={classes.assetTypes}>{exchangeId.toUpperCase()}</div>
              {sortedAssetsByExchange[exchangeId].map((token, index) => {
                return <AssetInfoMM key={token.symbol + index} holding={token} />;
              })}
            </React.Fragment>
          )
      )}
    </div>
  );
});
