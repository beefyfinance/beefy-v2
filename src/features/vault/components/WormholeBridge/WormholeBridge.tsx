import { makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { styles } from './styles';
import { WormholeModal } from './WormholeModal';
import { Button } from '../../../../components/Button';
import { useTranslation } from 'react-i18next';
import { RewardTokenDetails } from '../AddTokenToWallet';
import { LinkButton } from '../../../../components/LinkButton';
import { LinkIcon } from '../../../../components/LinkIcon';
import Twitter from '../../../../images/icons/twitter.svg';
import Telegram from '../../../../images/icons/telegram.svg';
import Discord from '../../../../images/icons/discord.svg';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { CardContent } from '../Card/CardContent';
import { selectWalletAddress } from '../../../data/selectors/wallet';
import { fetchBalanceAction, fetchWormholeBalanceAction } from '../../../data/actions/balance';
import { selectWormholeBalance } from '../../../data/selectors/balance';
import { formatBigDecimals } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

export const WormholeBridge = memo(function WormholeBridge() {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const rewardToken = useAppSelector(state =>
    selectTokenByAddress(state, 'arbitrum', '0x912ce59144191c1204e64559fe8253a0e49e6548')
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, 'arbitrum', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831')
  );
  const walletAddress = useAppSelector(selectWalletAddress);
  const [isOpen, setIsOpen] = useState(false);
  const wormhole = useAppSelector(state => selectWormholeBalance(state, walletAddress));

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (walletAddress) {
      dispatch(fetchWormholeBalanceAction({ walletAddress }));
      dispatch(fetchBalanceAction({ chainId: depositToken.chainId, tokens: [depositToken] }));
    }
  }, [setIsOpen, dispatch, walletAddress, depositToken]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchWormholeBalanceAction({ walletAddress }));
      const interval = setInterval(() => {
        dispatch(fetchWormholeBalanceAction({ walletAddress }));
      }, 15_000);
      return () => clearInterval(interval);
    }
  }, [dispatch, walletAddress]);

  return (
    <div>
      <div>
        <div className={classes.header}>
          <h2 className={classes.boostedBy}>
            <span>Wormhole Arbitrum</span> STIP
          </h2>
          <div className={classes.socials}>
            <LinkButton href={'https://wormhole.com/'} text={t('Boost-PartnerLink-website')} />
            <LinkIcon alt="twitter" logo={Twitter} href={'https://twitter.com/wormholecrypto'} />
            <LinkIcon alt="telegram" logo={Telegram} href={'https://t.me/wormholecrypto'} />
            <LinkIcon alt="discord" logo={Discord} href={'https://discord.gg/wormholecrypto'} />
          </div>
        </div>
        <CardContent>
          <div className={classes.text}>
            This Beefy vault is part of a Wormhole Foundation grant from Arbitrum DAO. To be
            eligible for extra ARB incentives users need to bridge native USDC to Arbitrum using
            Circle’s CCTP via Wormhole Connect and stake into this vault. Earned ARB rewards are
            displayed on{' '}
            <a
              className={classes.link}
              href="https://portalbridge.com/rewards-dashboard/"
            >{`Wormhole's Dashboard`}</a>{' '}
            and will be distributed weekly, for the next three months.
          </div>
          <div className={classes.bridge}>
            <div className={classes.eligible}>
              {"You've bridged"}{' '}
              <strong>
                {formatBigDecimals(wormhole.bridged, 2)} {'USDC'}
              </strong>{' '}
              {'so far'}
            </div>
            <IframeButton handleOpen={handleOpen} />
          </div>
          <RewardTokenDetails
            token={rewardToken}
            chainId={'arbitrum'}
            className={classes.rewardToken}
            appendText={
              wormhole.pendingRewards.gt(0) ? (
                <>{` (${formatBigDecimals(wormhole.pendingRewards, 4)} pending)`}</>
              ) : undefined
            }
          />
        </CardContent>
      </div>
      <WormholeModal open={isOpen} onClose={handleClose} />
    </div>
  );
});

interface IframeButtonProps {
  handleOpen: () => void;
}

export const IframeButton = React.memo<IframeButtonProps>(function IframeHandler({ handleOpen }) {
  const classes = useStyles();
  return (
    <Button className={classes.button} onClick={handleOpen} variant="success">
      Bridge USDC via Wormhole
    </Button>
  );
});
