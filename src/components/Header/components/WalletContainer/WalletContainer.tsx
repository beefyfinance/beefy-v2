import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  askForWalletConnection,
  doDisconnectWallet,
} from '../../../../features/data/actions/wallet.ts';
import { useResolveAddress } from '../../../../features/data/hooks/resolver.ts';
import { isFulfilledStatus } from '../../../../features/data/reducers/wallet/resolver-types.ts';
import {
  selectCurrentChainId,
  selectIsBalanceHidden,
  selectIsWalletConnected,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet.ts';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';
import iconUnsupportedChain from '../../../../images/icons/navigation/unsuported-chain.svg';
import {
  selectBeefyApiKeysWithRejectedData,
  selectChainIdsWithRejectedData,
  selectConfigKeysWithRejectedData,
} from '../../../../features/data/selectors/data-loader-helpers.ts';
import { selectHasWalletInitialized } from '../../../../features/data/selectors/data-loader/wallet.ts';
import { WalletButton } from './WalletButton.tsx';

const WalletContainer = memo(function WalletContainer() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const walletAddress = useAppSelector(selectWalletAddress);
  const walletInitialized = useAppSelector(selectHasWalletInitialized);
  const blurred = useAppSelector(selectIsBalanceHidden);
  const resolverStatus = useResolveAddress(walletAddress);
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletKnown = !!walletAddress;

  const rpcErrors = useAppSelector(state => selectChainIdsWithRejectedData(state));
  const beefyErrors = useAppSelector(state => selectBeefyApiKeysWithRejectedData(state));
  const configErrors = useAppSelector(state => selectConfigKeysWithRejectedData(state));

  const hasAnyError = useMemo(
    () => rpcErrors.length > 0 || beefyErrors.length > 0 || configErrors.length > 0,
    [rpcErrors, beefyErrors, configErrors]
  );

  const handleWalletConnect = useCallback(() => {
    if (walletAddress) {
      dispatch(doDisconnectWallet());
    } else {
      dispatch(askForWalletConnection());
    }
  }, [dispatch, walletAddress]);

  const label = useMemo(() => {
    if (!walletInitialized || !walletAddress) {
      return t('Network-ConnectWallet');
    }
    if (isFulfilledStatus(resolverStatus)) {
      return formatDomain(resolverStatus.value);
    }
    return formatAddressShort(walletAddress);
  }, [walletInitialized, walletAddress, resolverStatus, t]);

  return (
    <WalletButton
      initializing={!walletInitialized}
      connected={isWalletConnected}
      known={isWalletKnown}
      error={hasAnyError}
      onClick={handleWalletConnect}
      disabled={!walletInitialized}
    >
      <Address blurred={isWalletKnown && blurred}>{label}</Address>
      {isWalletConnected && <ActiveChain chainId={currentChainId} />}
    </WalletButton>
  );
});

const ActiveChain = ({ chainId }: { chainId: ChainEntity['id'] | null }) => {
  return (
    <Chain>
      <img
        height={20}
        width={20}
        alt={chainId ?? ''}
        src={chainId ? getNetworkSrc(chainId) : iconUnsupportedChain}
      />
    </Chain>
  );
};

const Chain = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    '& img': {
      height: '24px',
    },
  },
});

const Address = styled('div', {
  base: {},
  variants: {
    blurred: {
      true: {
        filter: 'blur(0.5rem)',
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WalletContainer;
