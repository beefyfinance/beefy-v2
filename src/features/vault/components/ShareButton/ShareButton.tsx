import { Dropdown } from '../../../../components/Dropdown';
import ShareIcon from '@material-ui/icons/Share';
import { Button } from '../../../../components/Button';
import * as React from 'react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import twitterIcon from '../../../../images/icons/share/twitter.svg';
import lensterIcon from '../../../../images/icons/share/lenster.svg';
import telegramIcon from '../../../../images/icons/share/telegram.svg';
import linkIcon from '../../../../images/icons/share/link.svg';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { Placement } from '@floating-ui/react-dom';

const useStyles = makeStyles(styles);

export type ShareButtonProps = {
  vaultId: VaultEntity['id'];
  campaign: string;
  placement?: Placement;
};

export const ShareButton = memo<ShareButtonProps>(function ShareButton({
  vaultId,
  placement,
  campaign,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const earnToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress)
  );

  const vaultDetails = useMemo<VaultDetails>(() => {
    const isGov = isGovVault(vault);
    const utm = {
      utm_campaign: campaign,
      utm_medium: 'social',
      utm_term: vault.id,
    };

    return {
      vault: vault.name + (isGov ? '' : ' ' + t('Vault-vault')),
      chain: chain.name,
      url: `${window.location.origin}/vault/${vault.id}`,
      token: isGov ? earnToken.symbol : depositToken.symbol,
      utm,
    };
  }, [vault, chain, depositToken, earnToken, campaign, t]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  return (
    <>
      <Button className={classes.shareButton} ref={anchorEl} onClick={handleOpen} active={isOpen}>
        <span className={classes.shareText}>{t('Vault-Share')}</span>
        <ShareIcon className={classes.shareIcon} />
      </Button>
      <Dropdown
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        placement={placement || 'bottom-end'}
        dropdownClassName={classes.dropdown}
        innerClassName={classes.dropdownInner}
      >
        <TwitterItem details={vaultDetails} />
        <LensterItem details={vaultDetails} />
        <TelegramItem details={vaultDetails} />
        <CopyLinkItem details={vaultDetails} />
      </Dropdown>
    </>
  );
});

type VaultDetails = {
  vault: string;
  chain: string;
  token: string;
  url: string;
  utm: {
    utm_medium: string;
    utm_campaign: string;
    utm_term: string;
  };
};

type ShareServiceItemProps = {
  details: VaultDetails;
};

const TwitterItem = memo<ShareServiceItemProps>(function TwitterItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t('Vault-Share-Twitter-Message', details);
    const url = `${details.url}?${new URLSearchParams({
      ...details.utm,
      utm_source: 'twitter',
    }).toString()}`;
    // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
    const params = new URLSearchParams({
      text: message,
      via: 'beefyfinance',
      url: url,
    });

    window.open(`https://twitter.com/intent/tweet?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Twitter')} onClick={onClick} icon={twitterIcon} />;
});

const LensterItem = memo<ShareServiceItemProps>(function LensterItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t('Vault-Share-Lenster-Message', details);
    const url = `${details.url}?${new URLSearchParams({
      ...details.utm,
      utm_source: 'lenster',
    }).toString()}`;
    // https://docs.lens.xyz/docs/integrating-lens
    const params = new URLSearchParams({
      text: message,
      via: 'beefyfinance',
      url: url,
    });

    window.open(`https://lenster.xyz/?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Lenster')} onClick={onClick} icon={lensterIcon} />;
});

const TelegramItem = memo<ShareServiceItemProps>(function TelegramItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t('Vault-Share-Telegram-Message', details);
    const url = `${details.url}?${new URLSearchParams({
      ...details.utm,
      utm_source: 'telegram',
    }).toString()}`;
    // https://core.telegram.org/widgets/share
    const params = new URLSearchParams({
      text: message,
      url: url,
    });

    window.open(`https://t.me/share/url?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Telegram')} onClick={onClick} icon={telegramIcon} />;
});

const CopyLinkItem = memo<ShareServiceItemProps>(function CopyLinkItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    try {
      const url = `${details.url}?${new URLSearchParams({
        ...details.utm,
        utm_source: 'clipboard',
      }).toString()}`;
      navigator.clipboard.writeText(url);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  }, [details]);

  return <ShareItem text={t('Vault-Share-CopyLink')} onClick={onClick} icon={linkIcon} />;
});

type ShareItemProps = {
  text: string;
  icon: string;
  onClick: () => void;
};
const ShareItem = memo<ShareItemProps>(function ShareItem({ text, icon, onClick }) {
  const classes = useStyles();

  return (
    <button className={classes.shareItem} onClick={onClick}>
      <img src={icon} width={24} height={24} alt="" aria-hidden={true} /> {text}
    </button>
  );
});
