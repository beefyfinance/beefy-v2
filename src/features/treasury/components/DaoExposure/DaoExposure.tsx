import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { formatPercent } from '../../../../helpers/format';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const data = [
  { key: 'stable', color: '#5C70D6', percentage: 0.4 },
  { key: 'bifi', color: '#5C99D6', percentage: 0.2 },
  { key: 'btc', color: '#5CC2D6', percentage: 0.2 },
  { key: 'eth', color: '#5CD6AD', percentage: 0.15 },
  { key: 'others', color: '#70D65C', percentage: 0.15 },
];

export const DaoExposure = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Section>
      <div className={classes.container}>
        <div className={classes.title}>{t('Exposure-Tokens')}</div>
        <div className={classes.bar}>
          {data.map(item => (
            <div
              style={{
                backgroundColor: item.color,
                width: formatPercent(item.percentage, 2, '0%'),
              }}
              className={classes.barItem}
            />
          ))}
        </div>
        <div className={classes.legendContainer}>
          {data.map(item => {
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
    </Section>
  );
});
