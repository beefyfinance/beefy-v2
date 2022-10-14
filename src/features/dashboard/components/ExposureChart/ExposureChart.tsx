import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useState } from 'react';
import { Cell, Pie, PieChart, PieProps, Sector } from 'recharts';
import { formatPercent } from '../../../../helpers/format';
import { styles } from './styles';

interface ExposureChartProps {
  title: string;
  data?: any;
}

const useStyles = makeStyles(styles);

type ActiveShapeProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  percent: number;
  value: number;
  key: string;
};
const ActiveShape = function ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  stroke,
  strokeWidth,
  percent,
  key,
  value,
}: ActiveShapeProps) {
  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
        {key}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
        {formatPercent(percent)}
      </text>
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

export const ExposureChart = memo<ExposureChartProps>(function ({ title, data }) {
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

  const colors = ['#5C70D6', '#5C99D6'];

  return (
    <div className={classes.container}>
      <div className={classes.title}>{title}</div>
      {data && (
        <div className={classes.holder}>
          <PieChart width={164} height={164}>
            <Pie
              data={data}
              dataKey="percent"
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
                <Cell key={asset.address} fill={colors[i]} stroke={'#2D3153'} strokeWidth={1} />
              ))}
            </Pie>
          </PieChart>
        </div>
      )}
    </div>
  );
});
