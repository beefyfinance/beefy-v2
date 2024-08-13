import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  Hidden,
  makeStyles,
  Toolbar,
  useMediaQuery,
} from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';
import { NavItem } from './components/NavItem';
import { ReactComponent as VaultsIcon } from '../../images/icons/navigation/vault.svg';
import { ReactComponent as DashboardIcon } from '../../images/icons/navigation/dashboard.svg';
import { ReactComponent as BridgeIcon } from '../../images/icons/navigation/bridge.svg';
import { ReactComponent as BuyCryptoIcon } from '../../images/icons/navigation/buy-crypto.svg';
import { ReactComponent as DaoIcon } from '../../images/icons/navigation/dao.svg';
import { ReactComponent as ResourcesIcon } from '../../images/icons/navigation/resources.svg';
import { DaoNavItems, ResourcesNavItems } from './list';
import { ConnectionStatus } from './components/ConnectionStatus';
import { DropNavItem } from './components/DropNavItem';
import { MobileMenu } from './components/MobileMenu';
import { Prices } from './components/Prices';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectShouldInitArticles,
  selectShouldInitProposals,
} from '../../features/data/selectors/data-loader';
import { fetchActiveProposals } from '../../features/data/actions/proposal';
import { UnreadProposalDot, UnreadArticleDot } from './components/Badges/UnreadDots';
import { fetchLastArticle } from '../../features/data/actions/articles';
import headerLogoMobile from '../../images/bifi-logos/header-logo-notext.svg';
import headerLogoDesktop from '../../images/bifi-logos/header-logo.svg';

const useStyles = makeStyles(styles);
export const Header = memo(function Header() {
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width: 500px)', { noSsr: true });
  const dispatch = useAppDispatch();
  const shouldLoadProposals = useAppSelector(selectShouldInitProposals);
  const shoudLoadArticles = useAppSelector(selectShouldInitArticles);

  useEffect(() => {
    if (shouldLoadProposals) {
      dispatch(fetchActiveProposals());
    }
  }, [dispatch, shouldLoadProposals]);

  useEffect(() => {
    if (shoudLoadArticles) {
      dispatch(fetchLastArticle());
    }
  }, [dispatch, shoudLoadArticles]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar className={clsx([classes.navHeader, classes.hasPortfolio])} position="static">
        <Container className={classes.container} maxWidth="lg">
          <Toolbar className={classes.content} disableGutters={true}>
            <div className={classes.flex}>
              <Link className={classes.beefy} to="/">
                <img alt="BIFI" src={isMobile ? headerLogoMobile : headerLogoDesktop} />
              </Link>
              <Hidden mdDown>
                <NavItem title={'Header-Vaults'} url="/" Icon={VaultsIcon} />
                <NavItem
                  exact={false}
                  title={'Header-Dashboard'}
                  url="/dashboard"
                  Icon={DashboardIcon}
                />
                <DropNavItem
                  title={'Header-Dao'}
                  Icon={DaoIcon}
                  items={DaoNavItems}
                  Badge={UnreadProposalDot}
                />
                <DropNavItem
                  title={'Header-Resources'}
                  Icon={ResourcesIcon}
                  items={ResourcesNavItems}
                  Badge={UnreadArticleDot}
                />
              </Hidden>
            </div>
            <div className={classes.flex}>
              <Hidden mdDown>
                <NavItem title={'Header-BuyCrypto'} url="/onramp" Icon={BuyCryptoIcon} />
                <NavItem title={'Header-BridgeBifi'} url="/bridge" Icon={BridgeIcon} />
                <Prices />
              </Hidden>
              <ConnectionStatus />
              <Hidden lgUp>
                <MobileMenu />
              </Hidden>
            </div>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
});
