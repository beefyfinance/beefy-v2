import { styled } from '@repo/styles/jsx';
import { memo, useEffect, useRef, useState } from 'react';
import { fetchLastArticle } from '../../features/data/actions/articles.ts';
import { fetchActiveProposals } from '../../features/data/actions/proposal.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { Container } from '../Container/Container.tsx';
import { ConnectionStatus } from './components/ConnectionStatus/ConnectionStatus.tsx';
import { LogoLink } from './components/LogoLink/LogoLink.tsx';
import { MainMenu } from './components/MainMenu/MainMenu.tsx';
import { MobileMenu } from './components/MobileMenu/MobileMenu.tsx';
import { BifiPricesDesktop } from './components/Prices/Prices.tsx';
import { selectShouldInitArticles } from '../../features/data/selectors/data-loader/articles.ts';
import { selectShouldInitProposals } from '../../features/data/selectors/data-loader/proposals.ts';

export const Header = memo(function Header() {
  const dispatch = useAppDispatch();
  const shouldLoadProposals = useAppSelector(selectShouldInitProposals);
  const shouldLoadArticles = useAppSelector(selectShouldInitArticles);
  const anchorEl = useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (shouldLoadProposals) {
      dispatch(fetchActiveProposals());
    }
  }, [dispatch, shouldLoadProposals]);

  useEffect(() => {
    if (shouldLoadArticles) {
      dispatch(fetchLastArticle());
    }
  }, [dispatch, shouldLoadArticles]);

  return (
    <HeaderContainer maxWidth="lg">
      <Side>
        <LogoLink />
        <MainMenu mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Side>
      <Side spacing="sm" shrink={true}>
        <RightSide ref={anchorEl}>
          <BifiPricesContainer>
            <BifiPricesDesktop positionRef={anchorEl} />
          </BifiPricesContainer>
          <ConnectionStatus />
        </RightSide>
        <MobileMenu mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      </Side>
    </HeaderContainer>
  );
});

const HeaderContainer = styled(Container, {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingBlock: '16px',
    md: {
      paddingBlock: '24px',
    },
  },
});

const Side = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
  },
  variants: {
    spacing: {
      sm: {
        columnGap: '10px',
      },
      md: {
        columnGap: '24px',
        '@media (max-width: 1002px)': {
          columnGap: '16px',
        },
      },
    },
    shrink: {
      true: {
        flexShrink: 1,
        minWidth: 0,
      },
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
});

const RightSide = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    columnGap: '10px',
    flexShrink: 1,
    minWidth: 0,
  },
});

const BifiPricesContainer = styled('div', {
  base: {
    '@media (max-width: 600px)': {
      display: 'none',
    },
  },
});
