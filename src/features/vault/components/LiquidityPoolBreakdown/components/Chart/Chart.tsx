import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { memo, type ReactElement, type SVGProps, useCallback, useMemo, useState } from 'react';
import type { CalculatedAsset } from '../../types.ts';
import type { PieProps } from 'recharts';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { styles } from './styles.ts';
import { formatLargePercent } from '../../../../../../helpers/format.ts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import type { Override } from '../../../../../data/utils/types-utils.ts';

const useStyles = legacyMakeStyles(styles);

type ActiveShapeProps = Override<
  PieSectorDataItem,
  {
    // cx: number;
    // cy: number;
    // midAngle: number;
    // innerRadius: number;
    // outerRadius: number;
    // startAngle: number;
    // endAngle: number;
    // fill: string;
    // stroke: string;
    // strokeWidth: number;
    payload?: CalculatedAsset;
    // percent: number;
    // value: number;
    dataKey: 'percent' | 'underlyingPercent';
  }
>;

const ActiveShapeComponent = function ({
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
  dataKey,
}: ActiveShapeProps) {
  return (
    <g>
      {payload && (
        <>
          <text x={cx} y={cy} dy={-8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
            {payload.symbol}
          </text>
          <text x={cx} y={cy} dy={8} textAnchor="middle" alignmentBaseline="middle" fill="#D0D0DA">
            {formatLargePercent(payload[dataKey])}
          </text>
        </>
      )}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={(innerRadius || 50) - 2}
        outerRadius={(outerRadius || 80) + 2}
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
  isUnderlying?: boolean;
};
export const Chart = memo(function Chart({ assets, isUnderlying }: ChartProps) {
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

  const dataKey = useMemo(() => (isUnderlying ? 'underlyingPercent' : 'percent'), [isUnderlying]);

  const ActiveShapeConstructor = useCallback(
    // eslint-disable-next-line react-x/no-nested-component-definitions
    (props: PieSectorDataItem): ReactElement<SVGProps<SVGElement>> => {
      return <ActiveShapeComponent {...props} dataKey={dataKey} />;
    },
    [dataKey]
  );

  return (
    <div className={classes.holder}>
      <PieChart width={164} height={164}>
        <Pie
          data={assets}
          dataKey={dataKey}
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
          activeShape={ActiveShapeConstructor}
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
