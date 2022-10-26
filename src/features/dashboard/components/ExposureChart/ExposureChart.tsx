import { makeStyles, Theme, useMediaQuery } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import React, { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDetails } from '../ChartDetails';
import { PieChartTooltip } from '../PieChartTooltip';
import { styles } from './styles';

interface ExposureChartProps {
  title: string;
  data: { key: string; value: BigNumber; percentage: number }[];
  type: 'chain' | 'platform' | 'token';
}

const useStyles = makeStyles(styles);

const COLORS = ['#5C70D6', '#5C99D6', '#5CC2D6', '#5CD6AD', '#70D65C', '#7FB24D'];

export const ExposureChart = memo<ExposureChartProps>(function ({ title, data, type }) {
  const classes = useStyles();
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  const chartPxs = React.useMemo(() => {
    return smUp ? 164 : 124;
  }, [smUp]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      {data && (
        <div className={classes.infoContainer}>
          <div className={classes.holder}>
            <ResponsiveContainer width={chartPxs} height={chartPxs}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="percentage"
                  valueKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={smUp ? 50 : 30}
                  outerRadius={smUp ? 80 : 60}
                  paddingAngle={0}
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((asset, i) => (
                    <Cell
                      key={asset.key}
                      fill={COLORS[i % data.length]}
                      stroke={'#242842'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  animationDuration={0}
                  isAnimationActive={false}
                  content={<PieChartTooltip type={type} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ChartDetails data={data} />
        </div>
      )}
    </div>
  );
});
