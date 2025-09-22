import { styled } from '@repo/styles/jsx';
import { memo, useEffect, useRef } from 'react';
import { fetchLastArticle } from '../../features/data/actions/articles.ts';
import { fetchActiveProposals } from '../../features/data/actions/proposal.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { Container } from '../Container/Container.tsx';
import { Hidden } from '../MediaQueries/Hidden.tsx';
import { Visible } from '../MediaQueries/Visible.tsx';
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
        <Visible from="lg">
          <MainMenu />
        </Visible>
      </Side>
      <Side spacing="sm">
        <Visible from="lg">
          <NavLinkItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
        </Visible>
        <RightSide ref={anchorEl}>
          <Visible from="lg">
            <BifiPricesDesktop positionRef={anchorEl} />
          </Visible>
          <ConnectionStatus />
        </RightSide>
        <Hidden from="lg">
          <MobileMenu />
        </Hidden>
      </Side>
    </HeaderContainer>
  );
});

const HeaderContainer = styled(Container, {
  base: {
    textStyle: 'body.medium',
    paddingBlock: '4px',
    minHeight: '64px',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    sm: {
      minHeight: 'auto',
      paddingBlock: '22px',
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
        lg: {
          columnGap: '20px',
        },
      },
      md: {
        columnGap: '24px',
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
