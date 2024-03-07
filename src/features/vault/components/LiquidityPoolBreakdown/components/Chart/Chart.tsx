import { makeStyles } from '@material-ui/core';
import { memo, useCallback, useState } from 'react';
import type { CalculatedAsset } from '../../types';
import type { PieProps } from 'recharts';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { styles } from './styles';
import { formatPercent } from '../../../../../../helpers/format';

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
  payload: CalculatedAsset;
  percent: number;
  value: CalculatedAsset['percent'];
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
  payload,
}: ActiveShapeProps) {
  return (
    <g>
      <text x={cx} y={cy} dy={-8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
        {payload.symbol}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
        {formatPercent(payload.percent)}
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

export type ChartProps = {
  assets: CalculatedAsset[];
};
export const Chart = memo<ChartProps>(function Chart({ assets }) {
  const classes = useStyles();
  const [activeIndex, setActiveIndex] = useState<undefined | number>(undefined);
  const onPieEnter = useCallback<Exclude<PieProps['onMouseEnter'], undefined>>(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const onPieLeave = useCallback<Exclude<PieProps['onMouseLeave'], undefined>>(() => {
    setActiveIndex(undefined);
  }, [setActiveIndex]);

  return (
    <div className={classes.holder}>
      <PieChart width={164} height={164}>
        <Pie
          data={assets}
          dataKey="percent"
          valueKey="symbol"
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
          {assets.map(asset => (
            <Cell key={asset.address} fill={asset.color} stroke={'#242842'} strokeWidth={3} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
});
