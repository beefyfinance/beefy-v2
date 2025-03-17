import { memo, useEffect } from 'react';
import { ConnectionStatus } from './components/ConnectionStatus/ConnectionStatus.tsx';
import { MobileMenu } from './components/MobileMenu/MobileMenu.tsx';
import { useAppDispatch, useAppSelector } from '../../store.ts';
import {
  selectShouldInitArticles,
  selectShouldInitProposals,
} from '../../features/data/selectors/data-loader.ts';
import { fetchActiveProposals } from '../../features/data/actions/proposal.ts';
import { fetchLastArticle } from '../../features/data/actions/articles.ts';
import { Container } from '../Container/Container.tsx';
import { LogoLink } from './components/LogoLink/LogoLink.tsx';
import { Hidden } from '../MediaQueries/Hidden.tsx';
import { styled } from '@repo/styles/jsx';
import { Visible } from '../MediaQueries/Visible.tsx';
import { MainMenu } from './components/MainMenu/MainMenu.tsx';
import { RightMenu } from './components/RightMenu/RightMenu.tsx';

export const Header = memo(function Header() {
  const dispatch = useAppDispatch();
  const shouldLoadProposals = useAppSelector(selectShouldInitProposals);
  const shouldLoadArticles = useAppSelector(selectShouldInitArticles);

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
      <Side>
        <Visible from="lg">
          <RightMenu />
        </Visible>
        <ConnectionStatus />
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
    padding: '4px 20px 4px 12px',
    minHeight: '64px',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    sm: {
      minHeight: 'auto',
      paddingBlock: '12px',
    },
  },
});

const Side = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    columnGap: '16px',
  },
});
