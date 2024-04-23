import clsx from 'clsx';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format';
import { Hidden, makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../store';
import { selectCowVaultById } from '../../../../data/selectors/vaults';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { selectCurrentCowcentratedRangesByVaultId } from '../../../../data/selectors/tokens';
import type { VaultEntity } from '../../../../data/entities/vault';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const CowcentratedChart = memo(function CowcentratedChart({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { currentPrice, priceRangeMin, priceRangeMax } = useAppSelector(state =>
    selectCurrentCowcentratedRangesByVaultId(state, vaultId)
  );

  const vault = useAppSelector(state => selectCowVaultById(state, vaultId));
  const priceString = `${vault.assetIds[1]}/${vault.assetIds[0]}`;

  const showInRange = useMemo(() => {
    return currentPrice.lte(priceRangeMax) && currentPrice.gte(priceRangeMin);
  }, [currentPrice, priceRangeMax, priceRangeMin]);

  return (
    <>
      <Hidden smUp>
        <div className={clsx(classes.cowcentratedStat, classes.fullWidth)}>
          <div className={classes.label}>
            {t('Current Price')}{' '}
            <span className={showInRange ? classes.inRange : classes.outOfRange}>
              ({t(showInRange ? 'In Range' : 'Out of Range')})
            </span>
          </div>

          <div className={classes.value}>
            {formatTokenDisplayCondensed(currentPrice, 18)} <span>{priceString}</span>
          </div>
        </div>
      </Hidden>
      <div className={classes.cowcentratedHeader}>
        <div className={clsx(classes.cowcentratedStat, classes.roundBottomLeft)}>
          <div className={classes.label}>{t('Min Price')}</div>
          <div className={classes.value}>
            {formatTokenDisplayCondensed(priceRangeMin, 18)} <span>{priceString}</span>
          </div>
        </div>
        <Hidden xsDown>
          <div className={classes.cowcentratedStat}>
            <div className={classes.label}>
              {t('Current Price')}{' '}
              <span className={showInRange ? classes.inRange : classes.outOfRange}>
                ({t(showInRange ? 'In Range' : 'Out of Range')})
              </span>
            </div>

            <div className={classes.value}>
              {formatTokenDisplayCondensed(currentPrice, 18)} <span>{priceString}</span>
            </div>
          </div>
        </Hidden>
        <div className={clsx(classes.cowcentratedStat, classes.roundBottomRight)}>
          <div className={classes.label}>{t('Max Price')}</div>
          <div className={classes.value}>
            {formatTokenDisplayCondensed(priceRangeMax, 18)} <span>{priceString}</span>
          </div>
        </div>
      </div>
    </>
  );
});
