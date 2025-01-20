import { Dropdown } from '../../../../components/Dropdown';
import ShareIcon from '@material-ui/icons/Share';
import { Button } from '../../../../components/Button';
import {
  memo,
  type MutableRefObject,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import twitterIcon from '../../../../images/icons/share/twitter.svg';
import lensterIcon from '../../../../images/icons/share/lenster.svg';
import telegramIcon from '../../../../images/icons/share/telegram.svg';
import linkIcon from '../../../../images/icons/share/link.svg';
import {
  isCowcentratedVault,
  isGovVault,
  isGovVaultCowcentrated,
} from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import { formatLargePercent } from '../../../../helpers/format';
import type { BeefyState } from '../../../../redux-types';
import {
  selectBoostById,
  selectBoostPartnerById,
  selectPreStakeOrActiveBoostIds,
} from '../../../data/selectors/boosts';
import type {
  BoostedVaultExtraDetails,
  CommonExtraDetails,
  CommonVaultDetails,
  GovVaultExtraDetails,
  ShareButtonProps,
  ShareItemProps,
  ShareServiceItemProps,
  VaultDetails,
} from './types';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export const ShareButton = memo<ShareButtonProps>(function ShareButton({
  vaultId,
  placement,
  mobileAlternative = false,
  hideText = false,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const anchorEl = useRef<HTMLButtonElement>();
  const [isOpen, setIsOpen] = useState(false);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const apys = useAppSelector(state => selectVaultTotalApy(state, vault.id));
  const commonVaultDetails = useMemo<CommonVaultDetails>(() => {
    return {
      vaultName: vault.names.singleMeta,
      vaultApy: formatLargePercent(apys.totalApy, 2),
      vaultUrl: `https://app.beefy.com/vault/${vault.id}`,
      chainName: chain.name,
      chainTag: '#' + chain.name.toLowerCase().replace(/[^a-z0-9-_]/gi, ''),
      beefyHandle: '@beefyfinance',
    };
  }, [vault, chain, apys]);
  const additionalSelector = useMemo(
    () =>
      (state: BeefyState): CommonExtraDetails | BoostedVaultExtraDetails | GovVaultExtraDetails => {
        if (isCowcentratedVault(vault)) {
          return { kind: 'clm' };
        }

        if (isGovVault(vault)) {
          if (isGovVaultCowcentrated(vault)) {
            return { kind: 'clm-pool' };
          }
          const token = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddresses[0]); // TODO: handle multiple earned tokens [empty = ok, not used when clm-like]
          return {
            kind: 'gov',
            earnToken: token.symbol,
            earnTokenTag: '$' + token.symbol.replace(/[^a-z0-9-_]/gi, ''),
          };
        }

        const boostIds = selectPreStakeOrActiveBoostIds(state, vault.id);
        if (boostIds.length && apys.boostApr && apys.boostApr > 0) {
          const boost = selectBoostById(state, boostIds[0]);
          if (boost && boost.partnerIds.length) {
            const mainPartner = selectBoostPartnerById(state, boost.partnerIds[0]);
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
              vaultApy: formatLargePercent(apys.boostedTotalApy, 2),
              boostToken: boostToken.symbol,
              boostTokenTag: '$' + boostToken.symbol.replace(/[^a-z0-9-_]/gi, ''),
              partnerName: boost.name,
              partnerHandle,
              partnerTag,
              partnerHandleOrTag,
            };
          }
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
      <Button
        className={clsx(classes.shareButton, {
          active: isOpen,
          [classes.mobileAlternative]: mobileAlternative,
        })}
        ref={anchorEl as RefObject<HTMLButtonElement>}
        onClick={handleOpen}
        active={isOpen}
        borderless={true}
      >
        {!hideText && <span className={classes.shareText}>{t('Vault-Share')}</span>}
        <ShareIcon className={classes.shareIcon} />
      </Button>
      <Dropdown
        anchorEl={anchorEl as MutableRefObject<HTMLElement>}
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
    const message = t(`Vault-Share-Message-${details.kind}`, details);

    // https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
    const params = new URLSearchParams({
      text: message,
      url: details.vaultUrl,
    });

    window.open(`https://x.com/intent/tweet?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Twitter')} onClick={onClick} icon={twitterIcon} />;
});

const LensterItem = memo<ShareServiceItemProps>(function LensterItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t(`Vault-Share-Message-${details.kind}`, details);

    // https://docs.lens.xyz/docs/integrating-lens
    const params = new URLSearchParams({
      text: message,
      url: details.vaultUrl,
    });

    window.open(`https://lenster.xyz/?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Lenster')} onClick={onClick} icon={lensterIcon} />;
});

const TelegramItem = memo<ShareServiceItemProps>(function TelegramItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    const message = t(`Vault-Share-Message-${details.kind}`, details);

    // https://core.telegram.org/widgets/share
    const params = new URLSearchParams({
      text: message,
      url: details.vaultUrl,
    });

    window.open(`https://t.me/share/url?${params}`, '_blank');
  }, [details, t]);

  return <ShareItem text={t('Vault-Share-Telegram')} onClick={onClick} icon={telegramIcon} />;
});

const CopyLinkItem = memo<ShareServiceItemProps>(function CopyLinkItem({ details }) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    try {
      navigator.clipboard.writeText(details.vaultUrl);
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
