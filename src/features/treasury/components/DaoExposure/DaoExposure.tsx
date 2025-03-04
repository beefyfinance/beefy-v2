import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { css } from '@repo/styles/css';
import { type FC, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../../components/Section/Section.tsx';
import { TreasuryAvailabilityExposure } from '../TreasuryAvailabilityExposure/TreasuryAvailabilityExposure.tsx';
import { TreasuryChainExposure } from '../TreasuryChainExposure/TreasuryChainExposure.tsx';
import { TreasuryTokensExposure } from '../TreasuryTokenExposure/TreasuryTokenExposure.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
                className={css(styles.option, item.value === chart && styles.active)}
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
