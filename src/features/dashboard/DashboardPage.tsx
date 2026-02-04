import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';
import { UnstakedClmBannerDashboard } from '../../components/Banners/UnstakedClmBanner/UnstakedClmBannerDashboard.tsx';
import { DashboardMeta } from '../../components/Meta/DashboardMeta.tsx';
import { FullscreenTechLoader, TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { isMaybeDomain, isValidAddress } from '../../helpers/addresses.ts';
import { useAppSelector } from '../data/store/hooks.ts';
import { useResolveDomain } from '../data/hooks/resolver.ts';
import { isFulfilledStatus, isRejectedStatus } from '../data/reducers/wallet/resolver-types.ts';
import { selectUserDepositedVaultIds } from '../data/selectors/balance.ts';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet.ts';
import { DepositSummary, DepositSummaryPlaceholder } from './components/DepositSummary.tsx';
import { Header } from './components/Header.tsx';
import {
  InvalidAddress,
  InvalidDomain,
  NoResults,
  NotConnected,
} from './components/NoResults/NoResults.tsx';
import { UserExposure } from './components/UserExposure/UserExposure.tsx';
import { UserVaults } from './components/UserVaults/UserVaults.tsx';
import { useInitDashboard } from './hooks.ts';
import { BeGemsBanner } from '../../components/Banners/BeGemsBanner/BeGemsBanner.tsx';
import { styled } from '@repo/styles/jsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';

export type DashboardProps = {
  mode: 'url' | 'wallet';
};

const DashboardPage = memo(function Dashboard({ mode }: DashboardProps) {
  return (
    <>
      <DashboardMeta />
      {mode === 'url' ?
        <DashboardFromUrl />
      : <DashboardFromWallet />}
    </>
  );
});

const DashboardFromUrl = memo(function DashboardFromWallet() {
  const { address: addressOrDomain } = useParams<{
    address: string;
  }>();

  if (addressOrDomain && isValidAddress(addressOrDomain)) {
    return <DashboardForAddress address={addressOrDomain.toLocaleLowerCase()} />;
  }

  if (addressOrDomain && isMaybeDomain(addressOrDomain)) {
    return <DashboardFromDomain domain={addressOrDomain} />;
  }

  return (
    <PageLayout
      contentAlignedCenter={true}
      content={
        <Content w100={true}>
          {addressOrDomain?.toLowerCase().startsWith('0x') ?
            <InvalidAddress />
          : <InvalidDomain />}
        </Content>
      }
    />
  );
});

const DashboardFromWallet = memo(function DashboardFromWallet() {
  const address = useAppSelector(state => selectWalletAddressIfKnown(state));

  if (address) {
    return <Navigate to={`/dashboard/${address}`} replace={true} />;
  }

  return (
    <PageLayout
      contentAlignedCenter={true}
      content={
        <Content w100={true}>
          <NotConnected />
        </Content>
      }
    />
  );
});

type DashboardFromDomainProps = {
  domain: string;
};
const DashboardFromDomain = memo(function DashboardFromDomain({
  domain,
}: DashboardFromDomainProps) {
  const { t } = useTranslation();
  const status = useResolveDomain(domain);

  if (isFulfilledStatus(status)) {
    return <DashboardForAddress address={status.value.toLocaleLowerCase()} addressLabel={domain} />;
  }

  if (isRejectedStatus(status)) {
    return (
      <PageLayout
        contentAlignedCenter={true}
        content={
          <Content w100={true}>
            <InvalidDomain />
          </Content>
        }
      />
    );
  }

  return <FullscreenTechLoader text={t('Loading')} />;
});

type DashboardForAddressProps = {
  address: string;
  addressLabel?: string | undefined;
};
const DashboardForAddress = memo(function DashboardForAddress({
  address,
  addressLabel,
}: DashboardForAddressProps) {
  const loading = useInitDashboard(address);
  const userVaults = useAppSelector(state => selectUserDepositedVaultIds(state, address));

  return (
    <>
      <DashboardMeta wallet={addressLabel || address} />
      <PageLayout
        header={
          <>
            <UnstakedClmBannerDashboard address={address} />
            <BeGemsBanner address={address} dashboard={true} />
            <Header address={address} addressLabel={addressLabel}>
              {loading ?
                <DepositSummaryPlaceholder />
              : <DepositSummary address={address} />}
            </Header>
          </>
        }
        content={
          <Content>
            {loading ?
              <TechLoader />
            : userVaults.length > 0 ?
              <UserInfoContainer>
                <UserExposure address={address} />
                <UserVaults address={address} />
              </UserInfoContainer>
            : <NoResults title={addressLabel || address} address={address} />}
          </Content>
        }
      />
    </>
  );
});

const UserInfoContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 24px',
    sm: {
      paddingBlock: '14px 48px',
    },
  },
  variants: {
    w100: {
      true: {
        width: '100%',
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default DashboardPage;
