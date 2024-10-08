import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { CardContent } from '../Card';
import { styles } from './styles';
import type { VaultEntity } from '../../../data/entities/vault';
import {
  selectBoostById,
  selectBoostCampaignById,
  selectBoostPartnerById,
  selectOffchainBoostCampaignByType,
  selectPreStakeOrActiveBoostIds,
} from '../../../data/selectors/boosts';
import { useAppSelector } from '../../../../store';
import { LinkIcon } from '../../../../components/LinkIcon';
import Twitter from '../../../../images/icons/twitter.svg';
import Telegram from '../../../../images/icons/telegram.svg';
import Discord from '../../../../images/icons/discord.svg';
import { selectBoostRewardsTokenEntity } from '../../../data/selectors/balance';
import { RewardTokenDetails } from '../RewardTokenDetails';
import type { BoostEntity } from '../../../data/entities/boost';
import type { TokenEntity } from '../../../data/entities/token';
import { Link } from '@material-ui/icons';
import type { BoostSocials } from '../../../data/apis/config-types';
import type { ChainEntity } from '../../../data/entities/chain';
import {
  selectVaultActiveMerklBoostCampaigns,
  selectVaultHasActiveMerklBoostCampaigns,
} from '../../../data/selectors/rewards';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';

const useStyles = makeStyles(styles);

export type BoostCardProps = {
  vaultId: VaultEntity['id'];
};

export const BoostCard = memo<BoostCardProps>(function BoostCard({ vaultId }) {
  const hasBaseActiveMerklCampaigns = useAppSelector(state =>
    selectVaultHasActiveMerklBoostCampaigns(state, vaultId)
  );

  return hasBaseActiveMerklCampaigns ? (
    <MerklBoostCard vaultId={vaultId} />
  ) : (
    <NormalBoostCard vaultId={vaultId} />
  );
});

export const MerklBoostCard = memo<BoostCardProps>(function MerklBoostCard({ vaultId }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const activeCampaigns = useAppSelector(state =>
    selectVaultActiveMerklBoostCampaigns(state, vaultId)
  );

  const campaign = useAppSelector(state =>
    selectOffchainBoostCampaignByType(state, activeCampaigns?.[0]?.type)
  );

  const rewardToken = useAppSelector(
    state =>
      (activeCampaigns &&
        selectTokenByAddress(
          state,
          activeCampaigns[0].rewardToken.chainId,
          activeCampaigns[0].rewardToken.address
        )) ||
      undefined
  );

  if (activeCampaigns && rewardToken && campaign) {
    const { title, description, social, learn } = campaign;
    return (
      <CampaignContent
        name={'Beefy'}
        title={title}
        learn={learn}
        description={description}
        social={social}
        rewardToken={rewardToken}
        chainId={vault.chainId}
        partnerIds={['optimism']}
      />
    );
  }

  return null;
});

export const NormalBoostCard = memo<BoostCardProps>(function BoostCard({ vaultId }) {
  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boost = useAppSelector(state => selectBoostById(state, boostIds[0]));
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));
  const BoostComponent = boost.campaignId ? CampaignBoostCard : PartnerBoostCard;

  return <BoostComponent boost={boost} rewardToken={rewardToken} />;
});

interface CampaignContentProps {
  name: string;
  title: string;
  description: string;
  learn: string;
  social: BoostSocials;
  rewardToken: TokenEntity;
  chainId: ChainEntity['id'];
  contractAddress?: string;
  partnerIds?: string[];
}

const CampaignContent = memo<CampaignContentProps>(function CampaignContent({
  name,
  title,
  description,
  learn,
  social,
  rewardToken,
  partnerIds,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.boostedBy}>
          {t('Vault-BoostedBy')}
          <span>{name}</span>
        </h2>
        <div className={classes.socials}>
          {learn && <LinkButton href={learn} text={t('Boost-learn-more')} />}
          {social.twitter && <LinkIcon alt="twitter" logo={Twitter} href={social.twitter} />}
          {social.telegram && <LinkIcon alt="telegram" logo={Telegram} href={social.telegram} />}
          {social.discord && <LinkIcon alt="discord" logo={Discord} href={social.discord} />}
        </div>
      </div>
      <CardContent className={classes.content}>
        <div className={classes.campaignTitle}>{title}</div>
        <div className={classes.campaignText}>{description}</div>
        {partnerIds && partnerIds.length > 0 && (
          <div className={classes.partners}>
            {partnerIds.map(partnerId => (
              <PartnerSubCard key={partnerId} partnerId={partnerId} />
            ))}
          </div>
        )}
        <RewardTokenDetails token={rewardToken} chainId={rewardToken.chainId} />
      </CardContent>
    </div>
  );
});

type InnerBoostCardProps = {
  boost: BoostEntity;
  rewardToken: TokenEntity;
};

const CampaignBoostCard = memo<InnerBoostCardProps>(function CampaignBoostCard({
  boost,
  rewardToken,
}) {
  const { title, description, learn, social } = useAppSelector(state =>
    selectBoostCampaignById(state, boost.campaignId || '')
  );

  return (
    <CampaignContent
      name={boost.name}
      title={title}
      description={description}
      learn={learn}
      social={social}
      rewardToken={rewardToken}
      chainId={boost.chainId}
      contractAddress={boost.contractAddress}
      partnerIds={boost.partnerIds}
    />
  );
});

type PartnerSubCardProps = {
  partnerId: string;
};

const PartnerSubCard = memo<PartnerSubCardProps>(function PartnerSubCard({ partnerId }) {
  const classes = useStyles();
  const { title, text, website, social } = useAppSelector(state =>
    selectBoostPartnerById(state, partnerId)
  );
  return (
    <div className={classes.partnerSubCard}>
      <div className={classes.partnerHeader}>
        <h4 className={classes.partnerTitle}>{title}</h4>
        <div className={classes.socials}>
          {website && <LinkIcon alt="website" href={website} logo={Link} />}
          {social.twitter && <LinkIcon alt="twitter" logo={Twitter} href={social.twitter} />}
          {social.telegram && <LinkIcon alt="telegram" logo={Telegram} href={social.telegram} />}
          {social.discord && <LinkIcon alt="discord" logo={Discord} href={social.discord} />}
        </div>
      </div>
      <div className={classes.partnerContent}>
        <div className={classes.partnerText}>{text}</div>
      </div>
    </div>
  );
});

const PartnerBoostCard = memo<InnerBoostCardProps>(function PartnerBoostCard({
  boost,
  rewardToken,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { text, social, website } = useAppSelector(state =>
    selectBoostPartnerById(state, boost.partnerIds[0])
  );

  return (
    <div>
      <div className={classes.header}>
        <h2 className={classes.boostedBy}>
          {t('Vault-BoostedBy')}
          <span>{boost.name}</span>
        </h2>
        <div className={classes.socials}>
          {website && <LinkButton href={website} text={t('Boost-PartnerLink-website')} />}
          {social.twitter && <LinkIcon alt="twitter" logo={Twitter} href={social.twitter} />}
          {social.telegram && <LinkIcon alt="telegram" logo={Telegram} href={social.telegram} />}
          {social.discord && <LinkIcon alt="discord" logo={Discord} href={social.discord} />}
        </div>
      </div>
      <CardContent className={classes.content}>
        <div>{text}</div>
        <RewardTokenDetails token={rewardToken} chainId={boost.chainId} />
      </CardContent>
    </div>
  );
});
