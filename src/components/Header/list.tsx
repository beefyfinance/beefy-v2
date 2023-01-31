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

export const DaoNavItems = [
  { title: 'Header-Proposals', Icon: ProposalsIcon, url: 'https://vote.beefy.finance/#/' },
  {
    title: 'Header-Treasury',
    Icon: TreasuryIcon,
    url: '/treasury',
  },
];

export const ResourcesNavItems = [
  { title: 'Header-Docs', Icon: DocsIcon, url: 'https://docs.beefy.finance/' },
  { title: 'Header-News', Icon: NewsIcon, url: 'https://beefy.com/articles/' },
  { title: 'Header-MediaKit', Icon: MediaKitIcon, url: 'https://beefy.com/media-kit/' },
  { title: 'Header-Audit', Icon: AuditIcon, url: 'https://github.com/beefyfinance/beefy-audits' },
];

export const MobileList = [
  { title: 'Header-Vaults', Icon: VaultsIcon, url: '/' },
  { title: 'Header-Dashboard', Icon: DashboardIcon, url: '/dashboard' },
  { title: 'Header-Dao', Icon: DaoIcon, items: DaoNavItems },
  { title: 'Header-Resources', Icon: ResourcesIcon, items: ResourcesNavItems },
  { title: 'Header-BuyCrypto', Icon: BuyCryptoIcon, url: '/onramp' },
  { title: 'Header-BridgeBifi', Icon: BridgeIcon, url: '/bridge' },
];
