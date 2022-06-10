import { memo } from 'react';
import { Hidden, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { formatApy, formatUsd } from '../../../../../helpers/format';
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

export const UserStats = memo(function () {
  const stats = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.userStats}>
      <UserStat
        label={t('Portfolio-Deposited')}
        value={formatUsd(stats.deposited.toNumber())}
        blurred={hideBalance}
      />
      <UserStat
        label={t('Portfolio-YieldMnth')}
        value={formatUsd(stats.monthly.toNumber())}
        blurred={hideBalance}
      />
      <Hidden xsDown>
        <UserStat
          label={t('Portfolio-YieldDay')}
          value={formatUsd(stats.daily.toNumber())}
          blurred={hideBalance}
        />
        <UserStat
          label={t('Portfolio-AvgAPY')}
          value={formatApy(stats.apy.toNumber(), 2, '0%')}
          blurred={hideBalance}
        />
      </Hidden>
    </div>
  );
});
