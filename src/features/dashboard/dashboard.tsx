import { makeStyles } from '@material-ui/core';
import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store';
import { selectDashboardDepositedVaultIdsForAddress } from '../data/selectors/balance';
import { DepositSummary } from './components/DepositSummary';
import { InvalidAddress, InvalidDomain, NoResults, NotConnected } from './components/NoResults';
import { UserExposure } from './components/UserExposure';
import { UserVaults } from './components/UserVaults';
import { styles } from './styles';
import { useInitDashboard } from './hooks';
import { Redirect, useParams } from 'react-router';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet';
import { TechLoader } from '../../components/TechLoader';
import { isMaybeDomain, isValidAddress } from '../../helpers/addresses';
import { isFulfilledStatus, isRejectedStatus } from '../data/reducers/wallet/resolver-types';
import { useTranslation } from 'react-i18next';
import { useResolveDomain } from '../data/hooks/resolver';
import { DashboardMeta } from '../../components/Meta/DashboardMeta';

const useStyles = makeStyles(styles);

export type DashboardProps = {
  mode: 'url' | 'wallet';
};

export const Dashboard = memo<DashboardProps>(function Dashboard({ mode }) {
  return (
    <>
      <DashboardMeta />
      {mode === 'url' ? <DashboardFromUrl /> : <DashboardFromWallet />}
    </>
  );
});

const DashboardFromUrl = memo(function DashboardFromWallet() {
  const { address: addressOrDomain } = useParams<{ address: string }>();

  if (isValidAddress(addressOrDomain)) {
    return <DashboardForAddress address={addressOrDomain.toLocaleLowerCase()} />;
  }

  if (isMaybeDomain(addressOrDomain)) {
    return <DashboardFromDomain domain={addressOrDomain} />;
  }

  return (
    <DashboardContainer>
      {addressOrDomain.toLowerCase().startsWith('0x') ? <InvalidAddress /> : <InvalidDomain />}
    </DashboardContainer>
  );
});

const DashboardFromWallet = memo(function DashboardFromWallet() {
  const address = useAppSelector(state => selectWalletAddressIfKnown(state));

  if (address) {
    return <Redirect to={`/dashboard/${address}`} />;
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
const DashboardFromDomain = memo<DashboardFromDomainProps>(function DashboardFromDomain({
  domain,
}) {
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

const DashboardContainer = memo<DashboardContainerProps>(function DashboardContainer({ children }) {
  const classes = useStyles();
  return <div className={classes.dashboard}>{children}</div>;
});

type DashboardForAddressProps = {
  address: string;
  addressLabel?: string | undefined;
};
const DashboardForAddress = memo<DashboardForAddressProps>(function DashboardForAddress({
  address,
  addressLabel,
}) {
  const loading = useInitDashboard(address);
  const userVaults = useAppSelector(state =>
    selectDashboardDepositedVaultIdsForAddress(state, address)
  );

  return (
    <DashboardContainer>
      <DashboardMeta wallet={addressLabel || address} />

      <DepositSummary address={address} addressLabel={addressLabel} />
      {loading ? (
        <TechLoader />
      ) : userVaults.length > 0 ? (
        <>
          <UserExposure address={address} />
          <UserVaults address={address} />
        </>
      ) : (
        <NoResults title={addressLabel || address} address={address} />
      )}
    </DashboardContainer>
  );
});
