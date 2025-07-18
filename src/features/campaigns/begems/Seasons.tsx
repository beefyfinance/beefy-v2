import { styled } from '@repo/styles/jsx';
import { type FC, lazy, memo, Suspense } from 'react';
import gemEmerald from '../../../images/campaigns/begems/emerald.svg';
import gemRuby from '../../../images/campaigns/begems/ruby.svg';
import gemSapphire from '../../../images/campaigns/begems/sapphire.svg';
import { SeasonExplainer } from './SeasonExplainer.tsx';
import { SeasonProgressBar } from './SeasonProgress.tsx';
import { SeasonTabs } from './SeasonTabs.tsx';
import { selectBeGemsSeasonType } from '../../data/selectors/campaigns/begems.ts';
import { useAppSelector } from '../../data/store/hooks.ts';
import { useBreakpoint } from '../../../components/MediaQueries/useBreakpoint.ts';
import type { SeasonConfig } from '../../data/reducers/campaigns/begems-types.ts';
import type { SeasonBoxProps } from './types.ts';
import { LoadingIndicator } from '../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { SeasonPointsLeaderboard } from './SeasonPointsLeaderboard.tsx';

const typeToBoxComponent: Record<SeasonConfig['type'], FC<SeasonBoxProps>> = {
  token: lazy(() => import('./SeasonTokenRedeem.tsx')),
  points: lazy(() => import('./SeasonPointsPosition.tsx')),
};

type SeasonsProps = {
  season: number;
  setSeason: (season: number) => void;
};

export const Seasons = memo(function Seasons({ season, setSeason }: SeasonsProps) {
  const type = useAppSelector(state => selectBeGemsSeasonType(state, season));
  const isMobile = useBreakpoint({ to: 'xs' });
  const showLeaderboard = type === 'points';
  const BoxComponent = typeToBoxComponent[type];
  const blurb = (
    <Blurb>
      <Ruby />
      <SeasonExplainer season={season} />
      {isMobile && <Sapphire />}
    </Blurb>
  );

  return (
    <Layout>
      {isMobile && blurb}
      <Bottom>
        <Tabs>
          <SeasonTabs selected={season} onChange={setSeason} />
          <SeasonProgressBar />
        </Tabs>
        <Background>
          <Row>
            {!isMobile && blurb}
            <Form>
              <Suspense fallback={<LoadingIndicator height={250} />}>
                <BoxComponent season={season} />
              </Suspense>
            </Form>
          </Row>
          <Emerald />
          {showLeaderboard && (
            <Leaderboard>
              <SeasonPointsLeaderboard season={season} />
            </Leaderboard>
          )}
        </Background>
        {!isMobile && <Sapphire />}
      </Bottom>
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
  },
});

const Bottom = styled('div', {
  base: {
    margin: '0 auto',
    width: '100%',
    maxWidth: '1176px',
    display: 'flex',
    flexDirection: 'column',
    paddingInline: '8px',
    position: 'relative',
    sm: {
      paddingInline: '24px',
    },
  },
});

const Tabs = styled('div', {
  base: {
    position: 'relative',
    width: '100%',
    zIndex: '[1]',
  },
});

const Background = styled('div', {
  base: {
    sm: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '56px 32px 64px 32px',
      gap: '32px',
      borderBottomRadius: '24px',
      background:
        'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%), {colors.darkBlue.70-40a}',
    },
    lg: {
      padding: '56px 64px 64px 64px',
      gap: '56px',
    },
  },
});

const Row = styled('div', {
  base: {
    borderBottomRadius: '24px',
    background:
      'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0) 100%), {colors.darkBlue.70}',
    sm: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: '80px',
      rowGap: '32px',
      borderRadius: '0',
      background: 'none',
    },
  },
});

const Column = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    sm: {
      justifyContent: 'center',
    },
  },
});

const Blurb = styled(Column, {
  base: {
    position: 'relative',
    paddingInline: '12px',
    sm: {
      flex: '1 1 480px',
      paddingInline: '0',
    },
    lg: {
      justifyContent: 'flex-start',
    },
  },
});

const Form = styled(Column, {
  base: {
    flex: '1 0 100%',
    position: 'relative',
    borderBottomRadius: 'inherit',
    sm: {
      flex: '1 0 400px',
      minWidth: '400px',
      background: 'none',
    },
    lg: {
      maxWidth: '400px',
    },
  },
});

const Leaderboard = styled('div', {
  base: {
    width: '100%',
  },
});

const Ruby = styled(
  'img',
  {
    base: {
      position: 'absolute',
      pointerEvents: 'none',
      top: '-12px',
      right: '-19px',
      width: '47px',
      sm: {
        right: 'auto',
        left: '-20px', // -32px padding, +12px still visible
        top: 'auto',
        bottom: '0',
        transform: 'translateX(-100%)',
        width: '99px',
      },
      md: {
        bottom: '50%',
        transform: 'translate(-100%,50%)',
      },
    },
  },
  {
    defaultProps: {
      alt: '',
      'aria-hidden': true,
      src: gemRuby,
    },
  }
);

const Sapphire = styled(
  'img',
  {
    base: {
      position: 'absolute',
      pointerEvents: 'none',
      bottom: '60px',
      right: '-5px',
      width: '36px',
      sm: {
        width: '71px',
        bottom: '29px',
        right: 'auto',
        left: '25%',
        transform: 'translateY(100%)',
      },
    },
  },
  {
    defaultProps: {
      alt: '',
      'aria-hidden': true,
      src: gemSapphire,
    },
  }
);

const Emerald = styled(
  'img',
  {
    base: {
      position: 'relative',
      pointerEvents: 'none',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '38px',
      zIndex: '[1]',
      sm: {
        display: 'none',
      },
      lg: {
        display: 'block',
        position: 'absolute',
        width: '47px',
        left: '70%', // 786/1128
        top: '0',
        transform: 'translateY(-50%)',
      },
    },
  },
  {
    defaultProps: {
      alt: '',
      'aria-hidden': true,
      src: gemEmerald,
    },
  }
);
