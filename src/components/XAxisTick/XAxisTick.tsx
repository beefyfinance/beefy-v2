import type { TextProps } from 'recharts';
import { Text } from 'recharts';
import { omit } from 'lodash-es';

interface Props {
  payload: {
    coordinate: number;
    index: number;
    offset: number;
    value: string;
  };
  tickFormatter?: (value: number | string) => string;
  visibleTicksCount: number;
  index: number;
  x: number;
  width: number;
}

type xAxisTickProps = Props & TextProps;

export function XAxisTick({
  payload,
  tickFormatter,
  visibleTicksCount,
  index,
  ...rest
}: xAxisTickProps) {
  const { value } = payload;
  const halfMaxTickTextWidth = 16;
  const textAnchor =
    index === 0 ? 'start'
    : index === visibleTicksCount - 1 && rest.x > rest.width - halfMaxTickTextWidth ? 'end'
    : 'middle';
  const textProps = omit(rest, ['ref']);

  return (
    <Text {...textProps} textAnchor={textAnchor} className="recharts-cartesian-axis-tick-value">
      {tickFormatter ? tickFormatter(value) : value}
    </Text>
  );
}
