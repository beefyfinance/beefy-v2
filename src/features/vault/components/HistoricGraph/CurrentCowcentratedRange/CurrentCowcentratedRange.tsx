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
import type { CurrentCowcentratedRangeData } from '../../../../data/entities/token';

const useStyles = makeStyles(styles);

type CurrentCowcentratedRangeIfAvailableProps = {
  vaultId: VaultEntity['id'];
};

export const CurrentCowcentratedRangeIfAvailable = memo<CurrentCowcentratedRangeIfAvailableProps>(
  function CowcentratedRangesIfAvailable({ vaultId }) {
    const range = useAppSelector(state => selectCurrentCowcentratedRangesByVaultId(state, vaultId));
    if (
      !range ||
      range.currentPrice.eq(BIG_ZERO) ||
      range.priceRangeMax.eq(BIG_ZERO) ||
      range.priceRangeMin.eq(BIG_ZERO)
    ) {
      return null;
    }

    return <CurrentCowcentratedRange vaultId={vaultId} range={range} />;
  }
);

type CurrentCowcentratedRangeProps = {
  vaultId: VaultEntity['id'];
  range: CurrentCowcentratedRangeData;
};

export const CurrentCowcentratedRange = memo<CurrentCowcentratedRangeProps>(
  function CowcentratedRanges({ vaultId, range }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const { currentPrice, priceRangeMin, priceRangeMax } = range;
    const symbols = useAppSelector(state => selectVaultTokenSymbols(state, vaultId));
    const priceString = `${symbols[1]}/${symbols[0]}`;
    const showInRange = useMemo(() => {
      return currentPrice.lte(priceRangeMax) && currentPrice.gte(priceRangeMin);
    }, [currentPrice, priceRangeMax, priceRangeMin]);

    return (
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
    );
  }
);
