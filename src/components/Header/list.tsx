import { ReactComponent as VaultsIcon } from '../../images/icons/navigation/vault.svg';
import { ReactComponent as DashboardIcon } from '../../images/icons/navigation/dashboard.svg';
import { ReactComponent as BridgeIcon } from '../../images/icons/navigation/bridge.svg';
import { ReactComponent as BuyCryptoIcon } from '../../images/icons/navigation/buy-crypto.svg';
import { ReactComponent as ResourcesIcon } from '../../images/icons/navigation/resources.svg';
import { ReactComponent as ProposalsIcon } from '../../images/icons/navigation/proposals.svg';
import { ReactComponent as DocsIcon } from '../../images/icons/navigation/docs.svg';
import { ReactComponent as NewsIcon } from '../../images/icons/navigation/news.svg';
import { ReactComponent as MediaKitIcon } from '../../images/icons/navigation/media-kit.svg';
import { ReactComponent as AuditIcon } from '../../images/icons/navigation/audit.svg';
import { ReactComponent as TreasuryIcon } from '../../images/icons/navigation/treasury.svg';
import { ReactComponent as DaoIcon } from '../../images/icons/navigation/dao.svg';
import { ReactComponent as PartnersIcon } from '../../images/icons/navigation/partners.svg';
import { ReactComponent as AnalyticsIcon } from '../../images/icons/navigation/analytics.svg';
import { ReactComponent as ProfitDistributionIcon } from '../../images/icons/navigation/profit-distribution.svg';
import {
  MainProposalsNavItem,
  ProfitProposalsNavItem,
} from './components/NavItem/ProposalsNavItem';
import type { NavConfig, NavItemConfig } from './components/DropNavItem/types';
import {
  MainProposalsMobileNavItem,
  ProfitProposalsMobileNavItem,
} from './components/NavItem/ProposalsMobileNavItem';
import { ArticlesNavItem } from './components/NavItem/ArticlesNavItem';
import { ArticlesMobileNavItem } from './components/NavItem/ArticlesMobileNavItem';

export const DaoNavItems: NavItemConfig[] = [
  {
    title: 'Header-Treasury',
    Icon: TreasuryIcon,
    url: '/treasury',
  },
  {
    title: 'Header-Proposals',
    Icon: ProposalsIcon,
    url: 'https://vote.beefy.finance/#/',
    Component: MainProposalsNavItem,
    MobileComponent: MainProposalsMobileNavItem,
  },
  {
    title: 'Header-ProfitDistribution',
    Icon: ProfitDistributionIcon,
    url: 'https://snapshot.box/#/s:profit.beefy.eth/',
    Component: ProfitProposalsNavItem,
    MobileComponent: ProfitProposalsMobileNavItem,
  },
];

export const ResourcesNavItems: NavItemConfig[] = [
  { title: 'Header-Docs', Icon: DocsIcon, url: 'https://docs.beefy.finance/' },
  {
    title: 'Header-News',
    Icon: NewsIcon,
    url: 'https://beefy.com/articles/',
    Component: ArticlesNavItem,
    MobileComponent: ArticlesMobileNavItem,
  },
  { title: 'Header-MediaKit', Icon: MediaKitIcon, url: 'https://beefy.com/media-kit/' },
  { title: 'Header-Audit', Icon: AuditIcon, url: 'https://github.com/beefyfinance/beefy-audits' },
  { title: 'Header-Partners', Icon: PartnersIcon, url: 'https://beefy.com/partners' },
  { title: 'Header-Analytics', Icon: AnalyticsIcon, url: 'https://analytics.beefy.finance/' },
];

export const MobileList: NavConfig[] = [
  { title: 'Header-Vaults', Icon: VaultsIcon, url: '/' },
  { title: 'Header-Dashboard', Icon: DashboardIcon, url: '/dashboard', exact: false },
  { title: 'Header-Dao', Icon: DaoIcon, items: DaoNavItems },
  { title: 'Header-Resources', Icon: ResourcesIcon, items: ResourcesNavItems },
  { title: 'Header-BuyCrypto', Icon: BuyCryptoIcon, url: '/onramp' },
  { title: 'Header-BridgeBifi', Icon: BridgeIcon, url: '/bridge' },
];
