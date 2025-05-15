import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownContent } from '../../../../components/Dropdown/DropdownContent.tsx';
import { DropdownProvider } from '../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownButtonTrigger } from '../../../../components/Dropdown/DropdownTrigger.tsx';
import { formatLargePercent } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import ShareIcon from '../../../../images/icons/mui/Share.svg?react';
import lensterIcon from '../../../../images/icons/share/lenster.svg';
import linkIcon from '../../../../images/icons/share/link.svg';
import telegramIcon from '../../../../images/icons/share/telegram.svg';
import twitterIcon from '../../../../images/icons/share/twitter.svg';
import {
  isCowcentratedVault,
  isGovVault,
  isGovVaultCowcentrated,
} from '../../../data/entities/vault.ts';
import { selectVaultTotalApy } from '../../../data/selectors/apy.ts';
import {
  selectBoostById,
  selectBoostPartnerById,
  selectPreStakeOrActiveBoostIds,
} from '../../../data/selectors/boosts.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { selectTokenByAddress } from '../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import type { BeefyState } from '../../../data/store/types.ts';
import { styles } from './styles.ts';
import type {
  BoostedVaultExtraDetails,
  CommonExtraDetails,
  CommonVaultDetails,
  GovVaultExtraDetails,
  ShareButtonProps,
  ShareItemProps,
  ShareServiceItemProps,
  VaultDetails,
} from './types.ts';

const useStyles = legacyMakeStyles(styles);

export const ShareButton = memo(function ShareButton({
  vaultId,
  placement,
  mobileAlternative = false,
  hideText = false,
}: ShareButtonProps) {
  const { t } = useTranslation();
  const classes = useStyles();
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
          if (boost && boost.partners?.length) {
            const mainPartner = selectBoostPartnerById(state, boost.partners[0]);
            const reward = boost.rewards[0];
            const boostToken = selectTokenByAddress(state, reward.chainId, reward.address);
            const partnerTag = '#' + boost.title.toLowerCase().replace(' ', '');
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
              partnerName: boost.title,
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

  return (
    <DropdownProvider variant="dark" placement={placement || 'bottom-end'}>
      <ShareTrigger borderless={true} mobile={true}>
        {!hideText && !mobileAlternative && <span>{t('Vault-Share')}</span>}
        <ShareIcon className={classes.shareIcon} />
      </ShareTrigger>
      <ShareDropdown>
        <TwitterItem details={vaultDetails} />
        <LensterItem details={vaultDetails} />
        <TelegramItem details={vaultDetails} />
        <CopyLinkItem details={vaultDetails} />
      </ShareDropdown>
    </DropdownProvider>
  );
});

const ShareDropdown = styled(DropdownContent, {
  base: {
    alignItems: 'flex-start',
    gap: '16px',
  },
});

const ShareTrigger = styled(DropdownButtonTrigger, {
  base: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    outline: 'none',
    '&:focus-visible, &.active': {
      outline: 'none',
      backgroundColor: 'bayOfMany',
    },
  },
  variants: {
    mobile: {
      true: {
        lgDown: {
          padding: '10px',
        },
      },
    },
  },
});

const TwitterItem = memo(function TwitterItem({ details }: ShareServiceItemProps) {
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

const LensterItem = memo(function LensterItem({ details }: ShareServiceItemProps) {
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

const TelegramItem = memo(function TelegramItem({ details }: ShareServiceItemProps) {
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

const CopyLinkItem = memo(function CopyLinkItem({ details }: ShareServiceItemProps) {
  const { t } = useTranslation();
  const onClick = useCallback(() => {
    navigator.clipboard.writeText(details.vaultUrl).catch(e => {
      console.error('Failed to copy to clipboard', e);
    });
  }, [details]);

  return <ShareItem text={t('Vault-Share-CopyLink')} onClick={onClick} icon={linkIcon} />;
});

const ShareItem = memo(function ShareItem({ text, icon, onClick }: ShareItemProps) {
  const classes = useStyles();

  return (
    <button type="button" className={classes.shareItem} onClick={onClick}>
      <img src={icon} width={24} height={24} alt="" aria-hidden={true} /> {text}
    </button>
  );
});
