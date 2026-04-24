import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { keys } from '../../../../../../helpers/object.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { selectTreasuryAssetsByChainId } from '../../../../../data/selectors/treasury.ts';
import { AssetInfo } from '../AssetInfo/AssetInfo.tsx';
import { useSortedAssets } from './hooks.ts';
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
