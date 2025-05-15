import { css, type CssStyles } from '@repo/styles/css';
import { memo, type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../components/Button/Button.tsx';
import { LinkButton } from '../../../../components/LinkButton/LinkButton.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { explorerTokenUrl } from '../../../../helpers/url.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import PlusIcon from '../../../../images/icons/plus.svg?react';
import { addTokenToWalletAction } from '../../../data/actions/add-to-wallet.ts';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import type { TokenEntity } from '../../../data/entities/token.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { selectTokenByAddress } from '../../../data/selectors/tokens.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface RewardTokenDetailsProps {
  address: TokenEntity['address'];
  chainId: ChainEntity['id'];
  css?: CssStyles;
  prependButtons?: ReactNode;
  appendText?: ReactNode;
}

export const RewardTokenDetails = memo(function RewardTokenDetails({
  address,
  chainId,
  css: cssProp,
  prependButtons,
  appendText,
}: RewardTokenDetailsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const token = useAppSelector(state => selectTokenByAddress(state, chainId, address));
  const addTokenToWallet = useCallback(() => {
    dispatch(addTokenToWalletAction({ tokenAddress: token.address, chainId }));
  }, [dispatch, chainId, token.address]);

  return (
    <div className={css(styles.container, cssProp)}>
      <div className={classes.token}>
        <AssetsImage size={24} chainId={chainId} assetSymbols={[token.symbol]} />{' '}
        <div className={classes.text}>
          {t('Earn', { symbol: token.symbol })}
          {appendText ? appendText : null}
        </div>
      </div>
      <div className={classes.buttons}>
        {prependButtons ? prependButtons : null}
        <Button css={styles.button} onClick={addTokenToWallet}>
          {t('Add-To-Wallet')}
          <PlusIcon className={classes.icon} />
        </Button>
        <LinkButton href={explorerTokenUrl(chain, token.address)} text={t('Explorer')} />
      </div>
    </div>
  );
});
