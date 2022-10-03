import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage';
import { Button } from '../../../../components/Button';
import { LinkButton } from '../../../../components/LinkButton';
import { useAppSelector } from '../../../../store';
import { ChainEntity } from '../../../data/entities/chain';
import { TokenEntity } from '../../../data/entities/token';
import { selectChainById } from '../../../data/selectors/chains';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../data/selectors/wallet';
import { ReactComponent as PlusIcon } from '../../../../images/icons/plus.svg';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AddTokenToWalletProps {
  token: TokenEntity;
  chainId: ChainEntity['id'];
}

export const AddTokenToWallet = memo<AddTokenToWalletProps>(function ({ token, chainId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnSameChain = useAppSelector(state => selectCurrentChainId(state) === chainId);

  const addTokenToWallet = React.useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      });
    } catch (error) {}
  }, [token.address, token.decimals, token.symbol]);

  const explorerUrl = chain.explorerUrl + '/address/' + token.address;

  const shouldShowAddButton = isWalletConnected && isWalletOnSameChain;

  return (
    <div className={classes.container}>
      <div className={classes.token}>
        <AssetsImage size={24} chainId={chainId} assetIds={[token.id]} />{' '}
        <div className={classes.text}>{t('Earn', { symbol: token.symbol })}</div>
      </div>
      <div className={classes.buttons}>
        {shouldShowAddButton && (
          <Button className={classes.button} onClick={addTokenToWallet}>
            {t('Add-To-Wallet')}
            <PlusIcon className={classes.icon} />
          </Button>
        )}
        <LinkButton className={classes.linkButtonBg} href={explorerUrl} text={t('Explorer')} />
      </div>
    </div>
  );
});
