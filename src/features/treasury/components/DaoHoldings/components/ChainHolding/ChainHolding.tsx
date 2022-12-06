import { memo } from 'react';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles } from '@material-ui/core';
import { formatBigUsd } from '../../../../../../helpers/format';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { ChainEntity } from '../../../../../data/entities/chain';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  data;
}

export const ChainHolding = memo<ChainHoldingProps>(function ({ data }) {
  const { t } = useTranslation();
  const { chainId, totalHoldings, assets, stackedAssets, lockedAssets } = data;
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <img
          src={require(`../../../../../../images/networks/${chainId}.svg`).default}
          alt={chainId}
        />
        <div>{chain.name}</div>
        <span>{formatBigUsd(new BigNumber(totalHoldings))}</span>
      </div>
      <div className={classes.filter}>
        <div>{t('Asset')}</div>
        <div>{t('Holdings')}</div>
      </div>
      {assets && (
        <>
          <div className={classes.assetTypes}>{t('Liquid Assets')}</div>
          {assets.map(item => {
            return <AssetInfo chainId={chainId} />;
          })}
        </>
      )}
      {stackedAssets && (
        <>
          <div className={classes.assetTypes}>{t('Stacked Assets')}</div>
          {stackedAssets.map(item => {
            return <AssetInfo chainId={chainId} />;
          })}
        </>
      )}
      {lockedAssets && (
        <>
          <div className={classes.assetTypes}>{t('Locked Assets')}</div>
          {lockedAssets.map(item => {
            return <AssetInfo chainId={chainId} />;
          })}
        </>
      )}
    </div>
  );
});

interface AssetInfoProps {
  chainId: ChainEntity['id'];
}

const AssetInfo = memo<AssetInfoProps>(function ({ chainId }) {
  const classes = useStyles();
  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>
        <AssetsImage size={32} chainId={chainId} assetIds={['BIFI']} />
        <div>BIFI</div>
      </div>
      <div>
        <div className={classes.value}>2 LP</div>
        <div className={classes.subValue}>$700</div>
      </div>
    </div>
  );
});
