import { sva } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { askForNetworkChange, askForWalletConnection } from '../../features/data/actions/wallet.ts';
import { getWalletConnectionApi } from '../../features/data/apis/instances.ts';
import {
  selectAddToWalletIconUrl,
  selectAddToWalletToken,
} from '../../features/data/selectors/add-to-wallet.ts';
import { selectChainById } from '../../features/data/selectors/chains.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { Button } from '../Button/Button.tsx';
import { CopyText } from './CopyText.tsx';

const addTokenFormRecipe = sva({
  slots: ['details', 'label', 'buttons'],
  base: {
    details: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      textStyle: 'subline.sm',
    },
    buttons: {
      marginTop: '24px',
    },
  },
});

export const AddTokenForm = memo(function AddTokenForm() {
  const classes = addTokenFormRecipe();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const iconUrl = useAppSelector(selectAddToWalletIconUrl);
  const token = useAppSelector(selectAddToWalletToken);
  const { symbol, chainId, address, decimals } = token;
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const currentChainId = useAppSelector(selectCurrentChainId);
  const isWalletConnectedCorrectChain = isWalletConnected && currentChainId === chainId;

  const handleAddToken = useCallback(() => {
    const perform = async () => {
      const walletApi = await getWalletConnectionApi();
      const client = await walletApi.getConnectedViemClient();

      await client.watchAsset({
        type: 'ERC20',
        options: {
          address: address,
          symbol: symbol,
          decimals: decimals,
          image: iconUrl ?? undefined,
        },
      });
    };
    perform().catch(err => console.error(err));
  }, [address, symbol, decimals, iconUrl]);

  const handleConnect = useCallback(() => {
    if (!isWalletConnected) {
      dispatch(askForWalletConnection());
    }
  }, [dispatch, isWalletConnected]);

  const handleNetworkChange = useCallback(() => {
    dispatch(askForNetworkChange({ chainId }));
  }, [dispatch, chainId]);

  const handleClick =
    isWalletConnectedCorrectChain ? handleAddToken
    : isWalletConnected ? handleNetworkChange
    : handleConnect;

  return (
    <>
      <div className={classes.details}>
        <div className={classes.label}>{t('Token-Symbol')}</div>
        <CopyText value={token.symbol} />
        <div className={classes.label}>{t('Token-Address')}</div>
        <CopyText value={token.address} />
        <div className={classes.label}>{t('Token-Decimals')}</div>
        <CopyText value={token.decimals.toString()} />
      </div>
      <div className={classes.buttons}>
        <Button variant="success" fullWidth={true} borderless={true} onClick={handleClick}>
          {isWalletConnectedCorrectChain ?
            t('Add-To-Wallet')
          : isWalletConnected ?
            t('Network-Change', { network: chain.name })
          : t('Network-ConnectWallet')}
        </Button>
      </div>
    </>
  );
});
