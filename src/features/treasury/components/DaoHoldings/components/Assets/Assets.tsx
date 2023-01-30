import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import { ChainEntity } from '../../../../../data/entities/chain';
import { selectTreasuryAssetsByChainId } from '../../../../../data/selectors/treasury';
import { AssetInfo } from '../AssetInfo';
import { useSortedAssets } from './hooks';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AssetsProps {
  chainId: ChainEntity['id'];
}

export const Assets = memo<AssetsProps>(function ({ chainId }) {
  const { t } = useTranslation();

  const assets = useAppSelector(state => selectTreasuryAssetsByChainId(state, chainId));

  const { liquidAssets, lockedAssets, stakedAssets } = useSortedAssets(assets);
  const classes = useStyles();

  return (
    <div className={classes.assetsContainer}>
      {liquidAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Liquid Assets')}</div>
          {liquidAssets.map(token => {
            return <AssetInfo key={token.address} chainId={chainId} token={token} />;
          })}
        </>
      )}
      {stakedAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Staked Assets')}</div>
          {stakedAssets.map(token => {
            return <AssetInfo key={token.address} chainId={chainId} token={token} />;
          })}
        </>
      )}
      {lockedAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Locked Assets')}</div>
          {lockedAssets.map(token => {
            return <AssetInfo key={token.address} chainId={chainId} token={token} />;
          })}
        </>
      )}
    </div>
  );
});
