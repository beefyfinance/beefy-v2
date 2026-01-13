import { memo } from 'react';
import { DashboardMeta } from '../../components/Meta/DashboardMeta.tsx';
import { useAppSelector } from '../data/store/hooks.ts';
import { selectWalletAddressIfKnown } from '../data/selectors/wallet.ts';
import { Navigate } from 'react-router';
import { NotConnected } from './components/NoResults/NoResults.tsx';
import { NoticeLayout } from './Layouts.tsx';

const DashboardFromWallet = memo(function DashboardFromWallet() {
  const address = useAppSelector(state => selectWalletAddressIfKnown(state));

  if (address) {
    return <Navigate to={`/dashboard/${address}`} replace={true} />;
  }

  return <NoticeLayout content={<NotConnected />} />;
});

const DashboardPage = memo(() => {
  return (
    <>
      <DashboardMeta />
      <DashboardFromWallet />
    </>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default DashboardPage;
