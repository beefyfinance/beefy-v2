import { styled } from '@repo/styles/jsx';
import { memo, useState } from 'react';
import { useAppSelector } from '../../data/store/hooks.ts';
import gemEmerald from '../../../images/campaigns/begems/emerald.svg';
import gemRuby from '../../../images/campaigns/begems/ruby.svg';
import gemSapphire from '../../../images/campaigns/begems/sapphire.svg';
import { selectBeGemsSeasonNumbers } from '../../data/selectors/campaigns/begems.ts';
import { featureFlag_mockProgressBar } from '../../data/utils/feature-flags.ts';
import { Explainer } from './Explainer.tsx';
import { MockSeasonProgressBar, SeasonProgressBar } from './SeasonProgress.tsx';
import { SeasonRedeem } from './SeasonRedeem.tsx';
import { SeasonTabs } from './SeasonTabs.tsx';

const ProgressBar = featureFlag_mockProgressBar() ? MockSeasonProgressBar : SeasonProgressBar;

export const Seasons = memo(function Redeem() {
  const seasons = useAppSelector(selectBeGemsSeasonNumbers);
  const [season, setSeason] = useState(seasons[0]);

  return (
    <Clip>
      <Layout>
        <Blurb>
          <Ruby />
          <Explainer />
          <Sapphire />
        </Blurb>
        <Tabs>
          <SeasonTabs selected={season} options={seasons} onChange={setSeason} />
          <ProgressBar />
        </Tabs>
        <Form>
          <SeasonRedeem season={season} />
          <Emerald />
        </Form>
      </Layout>
    </Clip>
  );
});

const Clip = styled('div', {
  base: {
    overflowX: 'clip', // for progress bar
    width: '100%',
    paddingBottom: '80px', // for emerald
    md: {
      paddingBottom: '60px', // for sapphire
    },
  },
});

const Layout = styled('div', {
  base: {
    margin: '0 auto',
    width: '100%',
    maxWidth: '1176px',
    display: 'grid',
    gridTemplateRows: 'auto auto auto',
    gridTemplateColumns: 'minmax(0, 1fr)',
    paddingInline: '8px',
    sm: {
      paddingInline: '24px',
    },
    md: {
      gridTemplateRows: 'auto auto',
      gridTemplateColumns: '55% 45%',
    },
  },
});

const Tabs = styled('div', {
  base: {
    position: 'relative',
    md: {
      order: 1,
      gridColumn: '1 / -1',
    },
  },
});

const Column = styled('div', {
  base: {
    position: 'relative', // for gems
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    md: {
      justifyContent: 'center',
      padding: '32px',
      background:
        'linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 100.07%), rgba(36, 40, 66, 0.40)',
    },
  },
});

const Blurb = styled(Column, {
  base: {
    borderTopRadius: '20px',
    padding: '0 4px',
    md: {
      order: 2,
      borderRadius: '0 0 0 20px',
    },
    lg: {
      padding: '64px 40px 64px 64px',
      justifyContent: 'flex-start',
    },
  },
});

const Form = styled(Column, {
  base: {
    borderBottomRadius: '20px',
    md: {
      order: 3,
      borderBottomLeftRadius: '0',
    },
    lg: {
      padding: '160px 64px 64px 40px',
    },
  },
});

const Ruby = styled(
  'img',
  {
    base: {
      position: 'absolute',
      pointerEvents: 'none',
      top: '-12px',
      right: '16px',
      width: '54px',
      md: {
        width: '99px',
        right: 'auto',
        left: '-75px',
        top: 'calc(50% - 53px)',
      },
      lg: {
        left: '-85px',
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
      right: '-8px',
      width: '39px',
      md: {
        width: '71px',
        right: 'calc(50% - 35px)',
        bottom: '-60px',
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
      position: 'absolute',
      pointerEvents: 'none',
      bottom: '-80px',
      right: 'calc(50% - 17px)',
      width: '34px',
      zIndex: '[1]',
      md: {
        width: '59px',
        right: '60%',
        bottom: 'auto',
        top: '-15px',
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
