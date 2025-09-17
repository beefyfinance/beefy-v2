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
import { NavLinkItem } from './components/NavItem/NavLinkItem.tsx';
import BuyCryptoIcon from '../../images/icons/navigation/buy-crypto.svg?react';
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
      <Side spacing="sm">
        <OnRampContainer>
          <NavLinkItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
        </OnRampContainer>
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
    minHeight: '64px',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    sm: {
      minHeight: 'auto',
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
        columnGap: '20px',
        '@media (max-width: 1082px)': {
          columnGap: '16px',
        },
        '@media (max-width: 1044px)': {
          columnGap: '10px',
        },
      },
      md: {
        columnGap: '24px',
        '@media (max-width: 960px)': {
          columnGap: '12px',
        },
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
  },
});

const OnRampContainer = styled('div', {
  base: {
    '@media (max-width: 1044px)': {
      display: 'none',
    },
  },
});

const BifiPricesContainer = styled('div', {
  base: {
    '@media (max-width: 580px)': {
      display: 'none',
    },
  },
});
