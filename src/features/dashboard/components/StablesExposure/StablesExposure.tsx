import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { selectUserStablecoinsExposure } from '../../../data/selectors/balance';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const StablesExposure = memo(function () {
  const { t } = useTranslation();
  const stablecoinsExposureData = useAppSelector(state => selectUserStablecoinsExposure(state));
  const stablePercentage = stablecoinsExposureData.filter(item => item.key === 'stable');
  const classes = useStyles({
    stablesPercentage: formatPercent(stablePercentage[0]?.percentage, 0, '0%'),
  });
  return (
    <div className={classes.container}>
      <div className={classes.title}>{t('Exposure-Stables')}</div>
      <div className={classes.bar}>
        <div className={classes.stableBar} />
      </div>
      <div className={classes.legendContainer}>
        {stablecoinsExposureData.map(item => {
          return (
            <div key={item.key} className={classes.legendItem}>
              <div className={classes.square} style={{ backgroundColor: item.color }} />
              <div className={classes.label}>
                {item.key} <span>{formatPercent(item.percentage, 2, '0%')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
