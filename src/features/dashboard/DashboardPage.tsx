import { legacyMakeStyles } from '../../helpers/mui.ts';
import { memo, useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../store.ts';
import { selectUserDepositedVaultIds } from '../data/selectors/balance.ts';
import {
  InvalidAddress,
  InvalidDomain,
  NoResults,
  NotConnected,
} from './components/NoResults/NoResults.tsx';
import { UserExposure } from './components/UserExposure/UserExposure.tsx';
import { UserVaults } from './components/UserVaults/UserVaults.tsx';
import { styles } from './styles.ts';
import { useInitDashboard } from './hooks.tsx';
import { Navigate, useParams } from 'react-router';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet.ts';
import { TechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { isMaybeDomain, isValidAddress } from '../../helpers/addresses.ts';
import { isFulfilledStatus, isRejectedStatus } from '../data/reducers/wallet/resolver-types.ts';
import { useTranslation } from 'react-i18next';
import { useResolveDomain } from '../data/hooks/resolver.tsx';
import { DashboardMeta } from '../../components/Meta/DashboardMeta.tsx';
import { UnstakedClmBannerDashboard } from '../../components/Banners/UnstakedClmBanner/UnstakedClmBannerDashboard.tsx';
import { DepositSummary, DepositSummaryPlaceholder } from './components/DepositSummary.tsx';
import { Header } from './components/Header.tsx';
import { filteredVaultsActions } from '../data/reducers/filtered-vaults.ts';

const useStyles = legacyMakeStyles(styles);

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
    <DashboardContainer>
      {addressOrDomain?.toLowerCase().startsWith('0x') ?
        <InvalidAddress />
      : <InvalidDomain />}
    </DashboardContainer>
  );
});

const DashboardFromWallet = memo(function DashboardFromWallet() {
  const address = useAppSelector(state => selectWalletAddressIfKnown(state));

  if (address) {
    return <Navigate to={`/dashboard/${address}`} replace={true} />;
  }

  return (
    <DashboardContainer>
      <NotConnected />
    </DashboardContainer>
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
      <DashboardContainer>
        <InvalidDomain />
      </DashboardContainer>
    );
  }

  return <TechLoader text={t('Loading')} />;
});

type DashboardContainerProps = {
  children: ReactNode;
};

const DashboardContainer = memo(function DashboardContainer({ children }: DashboardContainerProps) {
  const classes = useStyles();
  return <div className={classes.dashboard}>{children}</div>;
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
  const dispatch = useAppDispatch();

  // Set the default sort to apy
  useEffect(() => {
    dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: 'default' }));
  }, [dispatch]);

  return (
    <DashboardContainer>
      <DashboardMeta wallet={addressLabel || address} />
      <UnstakedClmBannerDashboard address={address} />
      <Header address={address} addressLabel={addressLabel}>
        {loading ?
          <DepositSummaryPlaceholder />
        : <DepositSummary address={address} />}
      </Header>
      {loading ?
        <TechLoader />
      : userVaults.length > 0 ?
        <>
          <UserExposure address={address} />
          <UserVaults address={address} />
        </>
      : <NoResults title={addressLabel || address} address={address} />}
    </DashboardContainer>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default DashboardPage;
