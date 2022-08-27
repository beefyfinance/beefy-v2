import { makeStyles } from '@material-ui/core';
import { memo, useCallback, useState } from 'react';
import { CalculatedAsset } from '../../types';
import { Cell, Pie, PieChart, PieProps, Sector } from 'recharts';
import { styles } from './styles';
import { formatPercent } from '../../../../../../helpers/format';

const useStyles = makeStyles(styles);

const TRANSPARENT = '#00000000';

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
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  stroke,
  strokeWidth,
  payload,
  percent,
  value,
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
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
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

  const ringSize = 20;
  let outerRadius = 80;

  const NestedPie = (assets: CalculatedAsset[]) => {
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

    const cells = [];
    const underlying = [];

    let hasAnotherLevel = false;

    for (const asset of assets) {
      let style = asset.color === TRANSPARENT ? { display: 'none' } : {};
      cells.push(
        <Cell
          style={style}
          key={asset.address}
          fill={asset.color}
          stroke={asset.color === TRANSPARENT ? TRANSPARENT : '#2D3153'}
          strokeWidth={2}
        />
      );
      if (asset.underlying) {
        underlying.push(...asset.underlying);
        hasAnotherLevel = true;
      } else {
        underlying.push({
          ...asset,
          color: TRANSPARENT,
        });
      }
    }

    return (
      <>
        {(() => {
          if (hasAnotherLevel) {
            const fragment = NestedPie(underlying);
            outerRadius -= ringSize;
            return fragment;
          } else {
            return null;
          }
        })()}
        <Pie
          data={assets}
          dataKey="percent"
          valueKey="symbol"
          cx="50%"
          cy="50%"
          innerRadius={outerRadius - ringSize}
          outerRadius={outerRadius}
          paddingAngle={0}
          startAngle={90}
          endAngle={450}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          activeShape={ActiveShape}
          activeIndex={activeIndex}
        >
          {cells}
        </Pie>
      </>
    );
  };

  return (
    <div className={classes.holder}>
      <PieChart width={168} height={168}>
        {NestedPie(assets)}
      </PieChart>
    </div>
  );
});
function sx(arg0: string): import('react').CSSProperties {
  throw new Error('Function not implemented.');
}
