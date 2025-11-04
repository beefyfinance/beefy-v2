import { styled } from '@repo/styles/jsx';

export const PortfolioStatsContainer = styled('div', {
  base: {
    display: 'grid',
    gap: '2px',
    // Mobile (0-600px): 3 items stacked vertically
    gridTemplateColumns: '1fr',
    // Desktop (600px+): 3 items in one line with 6px gap
    sm: {
      gap: '6px',
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
});

export const PlatformStatsContainer = styled('div', {
  base: {
    display: 'grid',
    gap: '2px',
    // Mobile (0-360px): 2-2-1 layout (2 columns)
    gridTemplateColumns: 'repeat(2, 1fr)',
    '& > *:nth-child(5)': {
      gridColumn: 'span 2',
    },
    // Tablet (361px-959px): 3-2 layout (6 columns for even distribution)
    '@media (min-width: 600px)': {
      gridTemplateColumns: 'repeat(6, 1fr)',
      '& > *:nth-child(-n+3)': {
        gridColumn: 'span 2',
      },
      '& > *:nth-child(n+4)': {
        gridColumn: 'span 3',
      },
    },
    // Desktop (960px+): All 5 in one line with 6px gap
    md: {
      gap: '6px',
      gridTemplateColumns: 'repeat(5, 1fr)',
      '& > *:nth-child(-n+3)': {
        gridColumn: 'span 1',
      },
      '& > *:nth-child(n+4)': {
        gridColumn: 'span 1',
      },
      '& > *:nth-child(5)': {
        gridColumn: 'span 1',
      },
    },
  },
});
