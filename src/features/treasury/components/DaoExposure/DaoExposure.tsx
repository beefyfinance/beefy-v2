import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { type FC, useState } from 'react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section';
import { TreasuryAvailabilityExposure } from '../TreasuryAvailabilityExposure';
import { TreasuryChainExposure } from '../TreasuryChainExposure';
import { TreasuryTokensExposure } from '../TreasuryTokenExposure';
import { styles } from './styles';

const useStyles = makeStyles(styles);

enum ChartEnum {
  Token = 1,
  Chain,
  Availability,
}

const chartToComponent: Record<ChartEnum, FC> = {
  [ChartEnum.Token]: TreasuryTokensExposure,
  [ChartEnum.Chain]: TreasuryChainExposure,
  [ChartEnum.Availability]: TreasuryAvailabilityExposure,
};

export const DaoExposure = memo(function DaoExposure() {
  const { t } = useTranslation();
  const classes = useStyles();

  const items = useMemo(() => {
    return [
      { key: 'tokenExposure', value: ChartEnum.Token, text: t('Tokens') },
      { key: 'chainExposure', value: ChartEnum.Chain, text: t('Chains') },
      {
        key: 'availabilityExposure',
        value: ChartEnum.Availability,
        text: t('Exposure-Availability'),
      },
    ];
  }, [t]);

  const [chart, setChart] = useState<ChartEnum>(ChartEnum.Token);

  const Chart = useMemo(() => chartToComponent[chart], [chart]);

  return (
    <Section>
      <div className={classes.container}>
        <div className={classes.optionsContainer}>
          {items.map(item => {
            return (
              <div
                key={item.key}
                onClick={() => setChart(item.value)}
                className={clsx(classes.option, {
                  [classes.active]: item.value === chart,
                })}
              >
                {item.text}
              </div>
            );
          })}
        </div>
        <Chart />
      </div>
    </Section>
  );
});
