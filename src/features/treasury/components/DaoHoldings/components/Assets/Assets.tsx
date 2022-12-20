import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SortColumnHeader } from '../../../../../../components/SortColumnHeader';
import { ChainEntity } from '../../../../../data/entities/chain';
import { TreasuryTokenHoldings } from '../../../../../data/reducers/treasury';
import { AssetInfo } from '../AssetInfo';
import { useSortedAssets } from './hooks';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AssetsProps {
  assets: TreasuryTokenHoldings[];
  chainId: ChainEntity['id'];
}

export const Assets = memo<AssetsProps>(function ({ assets, chainId }) {
  const [sortDirection, setSortDirection] = React.useState<'desc' | 'asc'>('asc');
  const { t } = useTranslation();
  const { liquidAssets, lockedAssets, stakedAssets } = useSortedAssets(assets, sortDirection);
  const classes = useStyles();

  const handleSort = useCallback(() => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  }, [sortDirection]);

  return (
    <>
      <div className={classes.filter}>
        <div>{t('Asset')}</div>
        <SortColumnHeader
          key={'Holdings'}
          label={'Holdings'}
          sortKey={'holdings'}
          sorted={sortDirection}
          onChange={handleSort}
          className={classes.sortColumn}
        />
      </div>
      {liquidAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Liquid Assets')}</div>
          {liquidAssets.map(token => {
            return <AssetInfo chainId={chainId} token={token} />;
          })}
        </>
      )}
      {stakedAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Staked Assets')}</div>
          {stakedAssets.map(token => {
            return <AssetInfo chainId={chainId} token={token} />;
          })}
        </>
      )}
      {lockedAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Locked Assets')}</div>
          {lockedAssets.map(token => {
            return <AssetInfo chainId={chainId} token={token} />;
          })}
        </>
      )}
    </>
  );
});
