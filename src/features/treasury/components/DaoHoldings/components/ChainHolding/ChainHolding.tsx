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
import { selectTreasurySummaryByChainId } from '../../../../../data/selectors/treasury';
import { TreasuryTokenHoldings } from '../../../../../data/reducers/treasury';

const useStyles = makeStyles(styles);

interface ChainHoldingProps {
  chainId: ChainEntity['id'];
}

export const ChainHolding = memo<ChainHoldingProps>(function ({ chainId }) {
  const { t } = useTranslation();

  const { totalUsd, liquidAssets, stackedAssets } = useAppSelector(state =>
    selectTreasurySummaryByChainId(state, chainId)
  );

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
        <span>{formatBigUsd(new BigNumber(totalUsd))}</span>
      </div>
      <div className={classes.filter}>
        <div>{t('Asset')}</div>
        <div>{t('Holdings')}</div>
      </div>
      {liquidAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Liquid Assets')}</div>
          {liquidAssets.map(token => {
            return <AssetInfo chainId={chainId} token={token} />;
          })}
        </>
      )}
      {stackedAssets.length > 0 && (
        <>
          <div className={classes.assetTypes}>{t('Staked Assets')}</div>
          {stackedAssets.map(token => {
            return <AssetInfo chainId={chainId} token={token} />;
          })}
        </>
      )}
      {/* {lockedAssets && (
        <>
          <div className={classes.assetTypes}>{t('Locked Assets')}</div>
          {lockedAssets.map(item => {
            return <AssetInfo chainId={chainId} />;
          })}
        </>
      )} */}
    </div>
  );
});

interface AssetInfoProps {
  chainId: ChainEntity['id'];
  token: TreasuryTokenHoldings;
}

const AssetInfo = memo<AssetInfoProps>(function ({ chainId, token }) {
  const classes = useStyles();

  const assetId = token.assetType === 'token' ? token.oracleId : 'BIFI';

  const usdValue = new BigNumber(token.usdValue);

  //HIDE: All tokens
  if (usdValue.lt(10)) {
    return null;
  }

  return (
    <div className={classes.asset}>
      <div className={classes.assetFlex}>
        <AssetsImage size={32} chainId={chainId} assetIds={[assetId]} />
        <div>{token.oracleId || token.name}</div>
      </div>
      <div>
        <div className={classes.value}>
          {new BigNumber(token.balance).shiftedBy(-token.decimals).toFixed(2)}
        </div>
        <div className={classes.subValue}>{formatBigUsd(new BigNumber(token.usdValue))}</div>
      </div>
    </div>
  );
});
