import React, { useMemo } from 'react';
import transakSDK from '@transak/transak-sdk';
import { useAppSelector } from '../../store';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';

const DEFAULT_NETWORK = 'polygon';

const CHAINS_SUPPORT_USDC = ['arbitrum', 'avax', 'bsc', 'optimism', 'polygon'];

const TransakNav = ({ className, children }) => {
  const { REACT_APP_TRANSAK_API_KEY, REACT_APP_ENVIRONMENT } = process.env;
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const currentChainId = useAppSelector(selectCurrentChainId);

  const defaultNetwork = useMemo(() => {
    // Transak can't receive avax as valid chain, so we need to transform to 'avaxcchain'
    const currentChain = currentChainId === 'avax' ? 'avaxcchain' : currentChainId;
    return !isWalletConnected || !CHAINS_SUPPORT_USDC.includes(currentChainId)
      ? DEFAULT_NETWORK
      : currentChain;
  }, [currentChainId, isWalletConnected]);

  const transak = new transakSDK({
    apiKey: REACT_APP_TRANSAK_API_KEY,
    environment: REACT_APP_ENVIRONMENT, // STAGING/PRODUCTION (Required)
    walletAddress: '',
    themeColor: '59A662',
    email: '',
    hostURL: window.location.origin,
    widgetHeight: '550px',
    widgetWidth: '450px',
    defaultNetwork,
    defaultCryptoCurrency: 'usdc',
    networks: 'arbitrum,avaxcchain,polygon,bsc,celo,fantom,moonriver,optimism', // NETWORK PREFFERENCES
    cryptoCurrencyList:
      'eth,weth,usdt,usdc,matic,dai,qi,bnb,bifi,avax,ftm,cusd,ceur,movr,aave,sushi,busd,quick,celo,wbtc',
    defaultCryptoAmount: 150,
  });

  function initTransak() {
    transak.init();
  }

  return (
    <div className={className} onClick={initTransak}>
      {children}
    </div>
  );
};

export const Transak = React.memo(TransakNav);
