import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { formatPercent } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { selectTreasuryTokensExposure } from '../../../data/selectors/treasury';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#1e9c05'];

export const DaoExposure = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const exposure = useAppSelector(selectTreasuryTokensExposure);

  return (
    <Section>
      <div className={classes.container}>
        <div className={classes.title}>{t('Exposure-Tokens')}</div>
        <div className={classes.bar}>
          {Object.values(exposure).map((item, i) => (
            <div
              key={item.key}
              style={{
                backgroundColor: COLORS[i],
                width: formatPercent(item.percentage, 2, '0%'),
              }}
              className={classes.barItem}
            />
          ))}
        </div>
        <div className={classes.legendContainer}>
          {Object.values(exposure).map((item, i) => {
            return (
              <div key={item.key} className={classes.legendItem}>
                <div className={classes.square} style={{ backgroundColor: COLORS[i] }} />
                <div
                  className={clsx(classes.label, {
                    [classes.uppercase]: keyIsToken(item.key),
                  })}
                >
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

function keyIsToken(key: string) {
  if (key === 'others') return false;
  if (key === 'stables') return false;
  return true;
}
