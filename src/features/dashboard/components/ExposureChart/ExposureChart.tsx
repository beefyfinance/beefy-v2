import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import { Cell, Pie, PieChart, PieProps, Sector, Tooltip } from 'recharts';
import { ChartDetails } from '../ChartDetails';
import { PieChartTooltip } from '../PieChartTooltip';
import { styles } from './styles';

interface ExposureChartProps {
  title: string;
  data?: any;
  type: 'chain' | 'platform' | 'token';
}

const useStyles = makeStyles(styles);

type ActiveShapeProps = {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
};
const ActiveShape = function ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  stroke,
  strokeWidth,
}: ActiveShapeProps) {
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 2}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
};

export const ExposureChart = memo<ExposureChartProps>(function ({ title, data, type }) {
  const classes = useStyles();
  const [activeIndex, setActiveIndex] = useState<undefined | number>(undefined);
  const onPieEnter = useCallback<PieProps['onMouseEnter']>(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const onPieLeave = useCallback<PieProps['onMouseLeave']>(() => {
    setActiveIndex(undefined);
  }, [setActiveIndex]);

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      {data && (
        <div className={classes.infoContainer}>
          <div className={classes.holder}>
            <PieChart width={164} height={164}>
              <Pie
                data={data}
                dataKey="percentage"
                valueKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={0}
                startAngle={90}
                endAngle={450}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                activeShape={ActiveShape}
                activeIndex={activeIndex}
              >
                {data.map((asset: any, i) => (
                  <Cell key={asset.address} fill={asset.color} stroke={'#2D3153'} strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<PieChartTooltip type={type} />} />
            </PieChart>
          </div>
          <ChartDetails data={data} />
        </div>
      )}
    </div>
  );
});
