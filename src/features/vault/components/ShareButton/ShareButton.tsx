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
import { isGovVault } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import { formatPercent } from '../../../../helpers/format';
import { BeefyState } from '../../../../redux-types';
import { selectBoostById, selectPreStakeOrActiveBoostIds } from '../../../data/selectors/boosts';
import { selectPartnerById } from '../../../data/selectors/partners';
import {
  BoostedVaultExtraDetails,
  CommonVaultDetails,
  GovVaultExtraDetails,
  Types,
  ShareButtonProps,
  ShareItemProps,
  ShareServiceItemProps,
  VaultDetails,
} from './types';
import { omit } from 'lodash';

const useStyles = makeStyles(styles);

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
  const apys = useAppSelector(state => selectVaultTotalApy(state, vault.id));
  const commonVaultDetails = useMemo<CommonVaultDetails>(() => {
    const utm = {
      utm_campaign: campaign,
      utm_medium: 'social',
      utm_term: vault.id,
    };

    return {
      vaultName: vault.name,
      vaultApy: formatPercent(apys.totalApy, 2),
      vaultUrl: `https://app.beefy.com/vault/${vault.id}`,
      chainName: chain.name,
      chainTag: '#' + chain.name.toLowerCase().replace(/[^a-z0-9-_]/gi, ''),
      beefyHandle: '@beefyfinance',
      utm,
    };
  }, [vault, chain, campaign, apys]);
  const additionalSelector = useMemo(
    () =>
      (state: BeefyState): Types | BoostedVaultExtraDetails | GovVaultExtraDetails => {
        if (isGovVault(vault)) {
          const token = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
          return {
            kind: 'gov',
            earnToken: token.symbol,
            earnTokenTag: '$' + token.symbol.replace(/[^a-z0-9-_]/gi, ''),
          };
        }

        const boostIds = selectPreStakeOrActiveBoostIds(state, vault.id);
        if (boostIds.length && apys.boostApr && apys.boostApr > 0) {
          const boost = selectBoostById(state, boostIds[0]);
          const mainPartner = selectPartnerById(state, boost.partnerIds[0]);
          const boostToken = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);
          const partnerTag = '#' + boost.name.toLowerCase().replace(' ', '');
          let partnerHandle;
          if (mainPartner.social?.twitter) {
            partnerHandle =
              '@' +
              mainPartner.social.twitter
                .replace(/https?:\/\/(www\.)?twitter\.com/gi, '')
                .replace('@', '')
                .replace('/', '');
          }
          const partnerHandleOrTag = partnerHandle || partnerTag;

          return {
            kind: 'boosted',
            vaultApy: formatPercent(apys.boostedTotalApy, 2),
            boostToken: boostToken.symbol,
            boostTokenTag: '$' + boostToken.symbol.replace(/[^a-z0-9-_]/gi, ''),
            partnerName: boost.name,
            partnerHandle,
            partnerTag,
            partnerHandleOrTag,
          };
        }

        return {
          kind: 'normal',
        };
      },
    [vault, apys]
  );
  const additionalVaultDetails = useAppSelector(additionalSelector);
  const vaultDetails: VaultDetails = useMemo(
    () => ({ ...commonVaultDetails, ...additionalVaultDetails }),
    [commonVaultDetails, additionalVaultDetails]
  );

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

const TwitterItem = memo<ShareServiceItemProps>(function TwitterItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t(`Vault-Share-Message-${details.kind}`, omit(details, ['utm']));
    const url = `${details.vaultUrl}?${new URLSearchParams({
      ...details.utm,
      utm_source: 'twitter',
    }).toString()}`;

    // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
    const params = new URLSearchParams({
      text: message,
      url: url,
    });

    window.open(`https://twitter.com/intent/tweet?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Twitter')} onClick={onClick} icon={twitterIcon} />;
});

const LensterItem = memo<ShareServiceItemProps>(function LensterItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t(`Vault-Share-Message-${details.kind as string}`, omit(details, ['utm']));
    const url = `${details.vaultUrl}?${new URLSearchParams({
      ...details.utm,
      utm_source: 'lenster',
    }).toString()}`;

    // https://docs.lens.xyz/docs/integrating-lens
    const params = new URLSearchParams({
      text: message,
      url: url,
    });

    window.open(`https://lenster.xyz/?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Lenster')} onClick={onClick} icon={lensterIcon} />;
});

const TelegramItem = memo<ShareServiceItemProps>(function TelegramItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t(`Vault-Share-Message-${details.kind as string}`, omit(details, ['utm']));
    const url = `${details.vaultUrl}?${new URLSearchParams({
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
      const url = `${details.vaultUrl}?${new URLSearchParams({
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

const ShareItem = memo<ShareItemProps>(function ShareItem({ text, icon, onClick }) {
  const classes = useStyles();

  return (
    <button className={classes.shareItem} onClick={onClick}>
      <img src={icon} width={24} height={24} alt="" aria-hidden={true} /> {text}
    </button>
  );
});
