import { memo, type ReactNode } from 'react';
import { styled } from '@repo/styles/jsx';
import { StatLoader } from '../../../../../components/StatLoader/StatLoader.tsx';

export type StatProps = {
  label: string | ReactNode;
  value: string | ReactNode;
  blurred?: boolean;
  loading?: boolean;
  onClick?: () => void;
  /** small chart beside the value, where the tiles have room */
  trend?: ReactNode;
};

export const Stat = memo<StatProps>(function UserStat({
  label,
  value,
  onClick,
  loading = false,
  blurred = false,
  trend,
}) {
  const showTrend = !!trend && !loading && !blurred;
  return (
    <StatContainer onClick={onClick} clickable={!!onClick} withTrend={showTrend}>
      <Value blurred={!loading && blurred}>
        {loading ?
          <StatLoader />
        : blurred ?
          '$100'
        : value}
      </Value>
      <Label>{label}</Label>
      {showTrend ?
        <Trend>{trend}</Trend>
      : null}
    </StatContainer>
  );
});

const StatContainer = styled('div', {
  base: {
    backgroundColor: 'background.content.darkest',
    paddingBlock: '8px',
    paddingInline: '12px',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    sm: {
      paddingInline: '18px',
      gap: '1px',
    },
  },
  variants: {
    clickable: {
      true: {
        cursor: 'pointer',
      },
    },
    withTrend: {
      // only where every tile in the row has room beside its value: the 3+2 rows from 768px, 5 across from lg
      true: {
        '@media (min-width: 768px) and (max-width: 959.98px), (min-width: 1260px)': {
          display: 'grid',
          gridTemplateColumns: 'max-content minmax(0, 84px)',
          justifyContent: 'space-between',
          columnGap: '12px',
        },
      },
    },
  },
});

const Trend = styled('div', {
  base: {
    display: 'none',
    gridColumn: '2',
    gridRow: '1 / span 2',
    alignSelf: 'end',
    height: '30px',
    // lifts the bars onto the label's text baseline, which sits 6px above its line box
    marginBottom: '6px',
    '@media (min-width: 768px) and (max-width: 959.98px), (min-width: 1260px)': {
      display: 'block',
    },
  },
});

const Label = styled('div', {
  base: {
    textStyle: 'subline.sm.semiBold',
    color: 'text.dark',
    display: 'inline-flex',
    gap: '4px',
  },
});

const Value = styled('div', {
  base: {
    textStyle: 'h3',
    color: 'text.light',
    // the loader is shorter than a line of text; keeps the tile from growing when data lands
    minHeight: '{lineHeights.h3}',
  },
  variants: {
    blurred: {
      true: {
        filter: 'blur(.5rem)',
        userSelect: 'none',
      },
    },
  },
});
