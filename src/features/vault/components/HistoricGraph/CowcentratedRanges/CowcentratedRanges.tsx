import { formatTokenDisplayCondensed } from '../../../../../helpers/format';
import { makeStyles } from '@material-ui/core';
import { useAppSelector } from '../../../../../store';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  selectCurrentCowcentratedRangesByVaultId,
  selectVaultTokenSymbols,
} from '../../../../data/selectors/tokens';
import type { VaultEntity } from '../../../../data/entities/vault';
import { styles } from './styles';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import { selectCowcentratedLikeVaultById } from '../../../../data/selectors/vaults';

const useStyles = makeStyles(styles);

export const CowcentratedRanges = memo(function CowcentratedRanges({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const { currentPrice, priceRangeMin, priceRangeMax } = useAppSelector(state =>
    selectCurrentCowcentratedRangesByVaultId(state, vault.cowcentratedId)
  );
  const symbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.cowcentratedId));
  const priceString = `${symbols[1]}/${symbols[0]}`;

  const showInRange = useMemo(() => {
    return currentPrice.lte(priceRangeMax) && currentPrice.gte(priceRangeMin);
  }, [currentPrice, priceRangeMax, priceRangeMin]);

  if (currentPrice.eq(BIG_ZERO) || priceRangeMin.eq(BIG_ZERO) || priceRangeMax.eq(BIG_ZERO)) {
    return null;
  }

  return (
    <>
      <div className={classes.cowcentratedHeader}>
        <div className={classes.cowcentratedStat}>
          <div className={classes.label}>{t('Min Price')}</div>
          <div className={classes.value}>
            {formatTokenDisplayCondensed(priceRangeMin, 18)} <span>{priceString}</span>
          </div>
        </div>

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
        <div className={classes.cowcentratedStat}>
          <div className={classes.label}>{t('Max Price')}</div>
          <div className={classes.value}>
            {formatTokenDisplayCondensed(priceRangeMax, 18)} <span>{priceString}</span>
          </div>
        </div>
      </div>
    </>
  );
});
