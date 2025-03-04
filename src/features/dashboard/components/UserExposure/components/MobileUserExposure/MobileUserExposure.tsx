import type { FC } from 'react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles.ts';
import { css } from '@repo/styles/css';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { TokenExposureLoader } from '../../../TokenExposure/TokenExposure.tsx';
import { ChainExposureLoader } from '../../../ChainExposure/ChainExposure.tsx';
import { PlatformExposureLoader } from '../../../PlatformExposure/PlatformExposure.tsx';
import type { ExposureDashboardChartLoaderProps } from '../../../ExposureChart/types.ts';

enum ChartEnum {
  Chain = 1,
  Token,
  Platform,
}

const chartToComponent: Record<ChartEnum, FC<ExposureDashboardChartLoaderProps>> = {
  [ChartEnum.Token]: TokenExposureLoader,
  [ChartEnum.Chain]: ChainExposureLoader,
  [ChartEnum.Platform]: PlatformExposureLoader,
};

const useStyles = legacyMakeStyles(styles);

interface MobileUserExposureProps {
  address: string;
}

export const MobileUserExposure = memo(function MobileUserExposure({
  address,
}: MobileUserExposureProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  const items = useMemo(() => {
    return [
      { key: 'tokenExposure', value: ChartEnum.Token, text: t('Tokens') },
      { key: 'chainExposure', value: ChartEnum.Chain, text: t('Chains') },
      {
        key: 'availabilityExposure',
        value: ChartEnum.Platform,
        text: t('Exposure-Platform'),
      },
    ];
  }, [t]);

  const [chart, setChart] = useState<ChartEnum>(ChartEnum.Token);

  const Chart = useMemo(() => chartToComponent[chart], [chart]);

  return (
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
      <Chart address={address} />
    </div>
  );
});
