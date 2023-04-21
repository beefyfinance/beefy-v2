import type { FC } from 'react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { TokenExposureLoader } from '../../../TokenExposure';
import { ChainExposureLoader } from '../../../ChainExposure';
import { PlatformExposureLoader } from '../../../PlatformExposure';
import type { ExposureDashboardChartLoaderProps } from '../../../ExposureChart/types';

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

const useStyles = makeStyles(styles);

export const MobileUserExposure = memo(function MobileUserExposure() {
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
  );
});
