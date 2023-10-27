import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage';
import { Button } from '../../../../components/Button';
import { LinkButton } from '../../../../components/LinkButton';
import { useAppDispatch, useAppSelector } from '../../../../store';
import type { ChainEntity } from '../../../data/entities/chain';
import type { TokenEntity } from '../../../data/entities/token';
import { selectChainById } from '../../../data/selectors/chains';
import { ReactComponent as PlusIcon } from '../../../../images/icons/plus.svg';
import { styles } from './styles';
import { explorerTokenUrl } from '../../../../helpers/url';
import { addTokenToWalletAction } from '../../../data/actions/add-to-wallet';

const useStyles = makeStyles(styles);

interface RewardTokenDetailsProps {
  token: TokenEntity;
  chainId: ChainEntity['id'];
}

export const RewardTokenDetails = memo<RewardTokenDetailsProps>(function RewardTokenDetails({
  token,
  chainId,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const addTokenToWallet = useCallback(() => {
    dispatch(addTokenToWalletAction({ tokenAddress: token.address, chainId }));
  }, [dispatch, chainId, token.address]);

  return (
    <div className={classes.container}>
      <div className={classes.token}>
        <AssetsImage size={24} chainId={chainId} assetIds={[token.id]} />{' '}
        <div className={classes.text}>{t('Earn', { symbol: token.symbol })}</div>
      </div>
      <div className={classes.buttons}>
        <Button className={classes.button} onClick={addTokenToWallet}>
          {t('Add-To-Wallet')}
          <PlusIcon className={classes.icon} />
        </Button>
        <LinkButton
          className={classes.linkButtonBg}
          href={explorerTokenUrl(chain, token.address)}
          text={t('Explorer')}
        />
      </div>
    </div>
  );
});
