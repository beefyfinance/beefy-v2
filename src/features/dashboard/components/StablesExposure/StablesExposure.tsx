import { css } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLargePercent } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { selectDashboardUserStablecoinsExposure } from '../../../data/selectors/dashboard.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface StablesExposureProps {
  address: string;
}

export const StablesExposure = memo(function StablesExposure({ address }: StablesExposureProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const stablecoinsExposureData = useAppSelector(state =>
    selectDashboardUserStablecoinsExposure(state, address)
  );
  const stablePercentage = stablecoinsExposureData.filter(item => item.key === 'stable');
  const percentage = Math.min(Math.max(0, (stablePercentage[0]?.percentage || 0) * 100), 100);
  const stableBarStyle = useMemo(
    () => ({
      width: `${percentage.toFixed(1)}%`,
    }),
    [percentage]
  );

  return (
    <div className={classes.container}>
      <div className={classes.title}>{t('Exposure-Stables')}</div>
      <div className={classes.bar}>
        <div
          className={css(styles.stableBar, percentage >= 100 && styles.stableBarComplete)}
          style={stableBarStyle}
        />
      </div>
      <div className={classes.legendContainer}>
        {stablecoinsExposureData.map(item => {
          return (
            <div key={item.key} className={classes.legendItem}>
              <div
                className={classes.square}
                style={{ backgroundColor: item.key === 'stable' ? '#3D5CF5' : '#C2D65C' }}
              />
              <div className={classes.label}>
                {item.key} <span>{formatLargePercent(item.percentage, 2, '0%')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
