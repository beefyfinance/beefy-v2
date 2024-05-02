import type { PropsWithChildren } from 'react';
import { memo } from 'react';
import { Hidden, makeStyles, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatLargePercent, formatLargeUsd } from '../../../../../helpers/format';
import { styles } from './styles';
import { useAppSelector } from '../../../../../store';
import { selectUserGlobalStats } from '../../../../data/selectors/apy';
import { selectIsBalanceHidden } from '../../../../data/selectors/wallet';

const useStyles = makeStyles(styles);

type UserStatProps = {
  label: string;
  value: string;
  blurred: boolean;
};
const UserStat = memo<UserStatProps>(function UserStat({ label, value, blurred }) {
  const classes = useStyles();

  return (
    <div className={classes.stat}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>
        <span className={blurred ? classes.blurred : undefined}>{blurred ? '$100' : value}</span>
      </div>
    </div>
  );
});

type VisibleAboveProps = PropsWithChildren<{
  width: number;
}>;
const VisibleAbove = memo<VisibleAboveProps>(function VisibleAbove({ width, children }) {
  const aboveWidth = useMediaQuery(`(min-width: ${width}px)`, { noSsr: true });
  return <>{aboveWidth ? children : null}</>;
});

export const UserStats = memo(function UserStats() {
  const stats = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.userStats}>
      <UserStat
        label={t('Portfolio-Deposited')}
        value={formatLargeUsd(stats.deposited)}
        blurred={hideBalance}
      />
      <UserStat
        label={t('Portfolio-YieldMnth')}
        value={formatLargeUsd(stats.monthly)}
        blurred={hideBalance}
      />
      <Hidden xsDown>
        <UserStat
          label={t('Portfolio-YieldDay')}
          value={formatLargeUsd(stats.daily)}
          blurred={hideBalance}
        />
      </Hidden>
      <VisibleAbove width={430}>
        <UserStat
          label={t('Portfolio-AvgAPY')}
          value={formatLargePercent(stats.apy, 2, '0%')}
          blurred={hideBalance}
        />
      </VisibleAbove>
    </div>
  );
});
