import React from 'react';
import transakSDK from '@transak/transak-sdk';

const TransakNav = ({ className, children }) => {
  const { REACT_APP_TRANSAK_API_KEY, REACT_APP_ENVIRONMENT } = process.env;

  const transak = new transakSDK({
    apiKey: REACT_APP_TRANSAK_API_KEY,
    environment: REACT_APP_ENVIRONMENT, // STAGING/PRODUCTION (Required)
    walletAddress: '',
    themeColor: '59A662',
    email: '',
    hostURL: window.location.origin,
    widgetHeight: '550px',
    widgetWidth: '450px',
    defaultNetwork: 'polygon',
    defaultCryptoCurrency: 'usdc',
    networks: 'arbitrum,avaxcchain,polygon,bsc,celo,fantom,moonriver', // NETWORK PREFFERENCES
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
