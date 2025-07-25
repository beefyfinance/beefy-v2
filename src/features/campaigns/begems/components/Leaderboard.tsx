import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { formatAddressShort, formatNumber } from '../../../../helpers/format.ts';

export type LeaderboardEntry = {
  position: number;
  address: string;
  points: number;
  highlight?: boolean;
};

export type LeaderboardProps = {
  entries: LeaderboardEntry[];
};

export const Leaderboard = memo(function Leaderboard({ entries }: LeaderboardProps) {
  return (
    <Table>
      {entries.map(e => (
        <EntryRow
          key={e.position}
          position={e.position}
          address={e.address}
          points={e.points}
          highlight={e.highlight}
        />
      ))}
    </Table>
  );
});

const EntryRow = memo(function EntryRow({
  points,
  position,
  address,
  highlight,
}: LeaderboardEntry) {
  const addressFormatted = formatAddressShort(address, 6);
  const positionFormatted = formatNumber(position, 0);
  const pointsFormatted = formatNumber(points, 0);

  return (
    <Row highlight={!!highlight}>
      <Position highlight={!!highlight}>#{positionFormatted}</Position>
      <Address highlight={!!highlight}>{addressFormatted}</Address>
      <Points highlight={!!highlight}>{pointsFormatted}</Points>
    </Row>
  );
});

const Table = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    textAlign: 'left',
  },
});

const Row = styled('div', {
  base: {
    display: 'flex',
    padding: '16px 12px',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: '16px',
    borderRadius: '12px',
    borderBottom: '1px solid var(--strokes-light-default, #242842)',
    width: '100%',
    _last: {
      borderBottom: 'none',
    },
    md: {
      padding: '16px 24px',
    },
  },
  variants: {
    highlight: {
      true: {
        background: 'white',
      },
    },
  },
});

const Cell = styled('div', {
  base: {
    flex: '0 0 auto',
    color: 'text.dark',
  },
  variants: {
    highlight: {
      true: {
        color: 'black',
      },
    },
  },
});

const Position = styled(Cell, {
  base: {
    textStyle: 'subline.sm.semiBold',
    width: '60px',
  },
});

const Address = styled(Cell, {
  base: {
    width: '102px',
    color: 'white.90-64a',
  },
  variants: {
    highlight: {
      true: {
        fontWeight: 'semiBold',
      },
    },
  },
});

const Points = styled(Cell, {
  base: {
    textStyle: 'body.medium',
    flex: '1 1 auto',
    textAlign: 'right',
    color: 'text.middle',
  },
  variants: {
    highlight: {
      true: {
        fontWeight: 'semiBold',
      },
    },
  },
});
