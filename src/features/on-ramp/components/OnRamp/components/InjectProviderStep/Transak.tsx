import React, { memo, useCallback } from 'react';
import { useAppSelector } from '../../../../../../store';
import { selectSelectedQuote } from '../../../../../data/selectors/on-ramp';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { selectWalletAddressIfKnown } from '../../../../../data/selectors/wallet';
import { getOnRampApi } from '../../../../../data/apis/instances';
import { useAsync } from '../../../../../../helpers/useAsync';
import { LoadingIndicator } from '../LoadingIndicator';
import { ApiUrlRequest } from '../../../../../data/apis/on-ramp/on-ramp-types';

const useStyles = makeStyles(styles);

export const Transak = memo(function () {
  const classes = useStyles();
  const { fiatAmount, fiat, tokenAmount, token, amountType, network, provider, paymentMethod } =
    useAppSelector(selectSelectedQuote);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const fetchUrl = useCallback(async () => {
    const params: ApiUrlRequest = {
      cryptoCurrency: token,
      fiatCurrency: fiat,
      amountType: amountType === 'token' ? 'crypto' : 'fiat',
      amount: amountType === 'token' ? tokenAmount : fiatAmount,
      network: network,
      provider: 'transak',
      paymentMethod: paymentMethod,
    };

    if (walletAddress) {
      params.address = walletAddress;
    }

    const api = await getOnRampApi();
    return await api.getUrl(params);
  }, [fiatAmount, fiat, tokenAmount, token, amountType, network, walletAddress, paymentMethod]);
  const { value: url, error: urlError, status: urlStatus } = useAsync(fetchUrl, null);

  return url ? (
    <iframe
      src={url}
      width="100%"
      height="100%"
      frameBorder="0"
      title={provider}
      className={classes.iframe}
      allow="payment"
    />
  ) : urlError ? (
    urlError
  ) : (
    <>
      <LoadingIndicator />
      {urlStatus}
    </>
  );
});

// eslint-disable-next-line no-restricted-syntax
export default Transak;
