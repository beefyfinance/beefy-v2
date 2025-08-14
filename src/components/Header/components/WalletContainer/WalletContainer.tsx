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
  selectIsWalletPending,
  selectWalletAddress,
} from '../../../../features/data/selectors/wallet.ts';
import { formatAddressShort, formatDomain } from '../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import { StatLoader } from '../../../StatLoader/StatLoader.tsx';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';
import iconUnsupportedChain from '../../../../images/icons/navigation/unsuported-chain.svg';
import {
  selectBeefyApiKeysWithRejectedData,
  selectChainIdsWithRejectedData,
  selectConfigKeysWithRejectedData,
} from '../../../../features/data/selectors/data-loader-helpers.ts';

const WalletContainer = memo(function WalletContainer() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const walletAddress = useAppSelector(selectWalletAddress);
  const walletPending = useAppSelector(selectIsWalletPending);
  const blurred = useAppSelector(selectIsBalanceHidden);
  const resolverStatus = useResolveAddress(walletAddress);
  const currentChainId = useAppSelector(selectCurrentChainId);

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

  return (
    <Button
      onClick={handleWalletConnect}
      status={
        isWalletConnected ?
          hasAnyError ?
            'error'
          : 'connected'
        : 'disconnected'
      }
    >
      {walletPending && !walletAddress ?
        <StatLoader width={116} foregroundColor="#68BE71" backgroundColor="#004708" />
      : <Address blurred={blurred}>
          {walletAddress ?
            isFulfilledStatus(resolverStatus) ?
              formatDomain(resolverStatus.value)
            : formatAddressShort(walletAddress)
          : t('Network-ConnectWallet')}
        </Address>
      }
      {isWalletConnected && <ActiveChain chainId={currentChainId} />}
    </Button>
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

const Button = styled('button', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    padding: '8px 16px',
    borderStyle: 'solid',
    borderWidth: '2px',
    color: 'text.light',
    textStyle: 'body.medium',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    height: '40px',
    gap: '8px',
  },
  variants: {
    status: {
      disconnected: {
        borderColor: 'green',
        backgroundColor: 'green',
      },
      error: {
        borderColor: 'orange.40-12',
        _hover: {
          borderColor: 'background.content.light',
        },
      },
      connected: {
        borderColor: 'green',
      },
    },
  },
  defaultVariants: {
    status: 'disconnected',
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default WalletContainer;
