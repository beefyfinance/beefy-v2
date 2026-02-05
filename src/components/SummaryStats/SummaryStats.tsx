import { memo } from 'react';
import { Stat, type StatProps } from '../../features/home/components/HomeHeader/Stats/Stat.tsx';
import { styled } from '@repo/styles/jsx';

type SummaryStatsProps = {
  items: StatProps[];
};

export const SummaryStats = memo(function SummaryStats({ items }: SummaryStatsProps) {
  return (
    <SummaryStatsContainer>
      {items.map(item => (
        <Stat key={item.label as string} label={item.label} value={item.value} />
      ))}
    </SummaryStatsContainer>
  );
});

const SummaryStatsContainer = styled('div', {
  base: {
    display: 'grid',
    gap: '2px',
    // Mobile (0-600px): 3 items stacked vertically
    gridTemplateColumns: '1fr',
    // Desktop (600px+): 3 items in one line
    md: {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
});
