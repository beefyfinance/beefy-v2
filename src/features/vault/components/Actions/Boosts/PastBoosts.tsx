import { legacyMakeStyles } from '../../../../../helpers/mui.ts';
import { Trans, useTranslation } from 'react-i18next';
import AnimateHeight from 'react-animate-height';
import { styles } from './styles.ts';
import { selectPastBoostIdsWithUserBalance } from '../../../../data/selectors/boosts.ts';
import type { BoostPromoEntity } from '../../../../data/entities/promo.ts';
import { useAppSelector } from '../../../../../store.ts';
import { BoostPastActionCard } from './BoostPastActionCard/BoostPastActionCard.tsx';

const useStyles = legacyMakeStyles(styles);

export function PastBoosts({ vaultId }: { vaultId: BoostPromoEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const pastBoostsWithUserBalance = useAppSelector(state =>
    selectPastBoostIdsWithUserBalance(state, vaultId)
  );

  if (pastBoostsWithUserBalance.length <= 0) {
    return <></>;
  }

  return (
    <div className={classes.containerExpired}>
      <div className={classes.title}>
        <span>
          <Trans
            t={t}
            i18nKey="Boost-ExpiredBoost"
            values={{ count: pastBoostsWithUserBalance.length }}
            components={{ white: <span className={classes.titleWhite} /> }}
          />
        </span>
      </div>
      <AnimateHeight duration={500} height="auto" contentClassName={classes.containerExpiredBoosts}>
        {pastBoostsWithUserBalance.map(boostId => (
          <BoostPastActionCard boostId={boostId} key={boostId} />
        ))}
      </AnimateHeight>
    </div>
  );
}
