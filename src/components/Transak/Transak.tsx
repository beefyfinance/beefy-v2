import React from 'react';
import transakSDK from '@transak/transak-sdk';
import { Typography } from '@material-ui/core';

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
    defaultCryptoAmount: 30,
  });

  function initTransak() {
    transak.init();
  }

  return (
    <Typography variant="body1" className={className} onClick={initTransak}>
      {children}
    </Typography>
  );
};

export const Transak = React.memo(TransakNav);
