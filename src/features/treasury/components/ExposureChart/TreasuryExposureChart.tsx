import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { PieChart } from '../../../../components/PieChart/PieChart';
import { ExposureBar } from '../ExposureBar';
import { ExposureLegend } from '../ExposureLegend';
import { styles } from './styles';
import type { GenericExposurePieChartProps } from '../../../../components/PieChart/types';
import { getTopNArray } from '../../../data/utils/array-utils';
import { BIG_ZERO } from '../../../../helpers/big-number';

const useStyles = makeStyles(styles);

type TreasuryExposureChartProps = Omit<GenericExposurePieChartProps, 'type'>;

export const TreasuryExposureChart = memo<TreasuryExposureChartProps>(
  function TreasuryExposureChart({ data, formatter }) {
    const classes = useStyles();
    const topSix = useMemo(
      () =>
        getTopNArray(data, 'percentage', 6, {
          key: 'others',
          value: BIG_ZERO,
          percentage: 0,
        }),
      [data]
    );

    return (
      <div className={classes.container}>
        <Hidden xsDown>
          <ExposureBar data={topSix} />
        </Hidden>
        <Hidden smUp>
          <PieChart data={topSix} type={'generic'} formatter={formatter} />
        </Hidden>
        <ExposureLegend data={topSix} formatter={formatter} />
      </div>
    );
  }
);
