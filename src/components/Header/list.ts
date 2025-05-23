import VaultsIcon from '../../images/icons/navigation/vault.svg?react';
import DashboardIcon from '../../images/icons/navigation/dashboard.svg?react';
import BridgeIcon from '../../images/icons/navigation/bridge.svg?react';
import BuyCryptoIcon from '../../images/icons/navigation/buy-crypto.svg?react';
import ResourcesIcon from '../../images/icons/navigation/resources.svg?react';
import ProposalsIcon from '../../images/icons/navigation/proposals.svg?react';
import DocsIcon from '../../images/icons/navigation/docs.svg?react';
import NewsIcon from '../../images/icons/navigation/news.svg?react';
import MediaKitIcon from '../../images/icons/navigation/media-kit.svg?react';
import AuditIcon from '../../images/icons/navigation/audit.svg?react';
import TreasuryIcon from '../../images/icons/navigation/treasury.svg?react';
import DaoIcon from '../../images/icons/navigation/dao.svg?react';
import PartnersIcon from '../../images/icons/navigation/partners.svg?react';
import AnalyticsIcon from '../../images/icons/navigation/analytics.svg?react';
import GemsIcon from '../../images/icons/navigation/gems.svg?react';
import ProfitDistributionIcon from '../../images/icons/navigation/profit-distribution.svg?react';
import {
  MainProposalsNavItem,
  ProfitProposalsNavItem,
} from './components/NavItem/ProposalsNavItem.tsx';
import { ArticlesNavItem } from './components/NavItem/ArticlesNavItem.tsx';
import type { NavConfig, NavItemConfig } from './components/DropNavItem/types.ts';

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
  },
  {
    title: 'Header-ProfitDistribution',
    Icon: ProfitDistributionIcon,
    url: 'https://snapshot.box/#/s:profit.beefy.eth/',
    Component: ProfitProposalsNavItem,
  },
];

export const ResourcesNavItems: NavItemConfig[] = [
  { title: 'Header-Docs', Icon: DocsIcon, url: 'https://docs.beefy.finance/' },
  {
    title: 'Header-News',
    Icon: NewsIcon,
    url: 'https://beefy.com/articles/',
    Component: ArticlesNavItem,
  },
  { title: 'Header-MediaKit', Icon: MediaKitIcon, url: 'https://beefy.com/media-kit/' },
  { title: 'Header-Audit', Icon: AuditIcon, url: 'https://github.com/beefyfinance/beefy-audits' },
  { title: 'Header-Partners', Icon: PartnersIcon, url: 'https://beefy.com/partners' },
  { title: 'Header-Analytics', Icon: AnalyticsIcon, url: 'https://analytics.beefy.finance/' },
  { title: 'Header-Gems', Icon: GemsIcon, url: '/campaigns/begems' },
];

export const MobileList: NavConfig[] = [
  { title: 'Header-Vaults', Icon: VaultsIcon, url: '/' },
  {
    title: 'Header-Dashboard',
    Icon: DashboardIcon,
    url: '/dashboard',
    end: false,
  },
  { title: 'Header-Dao', Icon: DaoIcon, items: DaoNavItems },
  { title: 'Header-Resources', Icon: ResourcesIcon, items: ResourcesNavItems },
  { title: 'Header-BuyCrypto', Icon: BuyCryptoIcon, url: '/onramp' },
  { title: 'Header-BridgeBifi', Icon: BridgeIcon, url: '/bridge' },
];
