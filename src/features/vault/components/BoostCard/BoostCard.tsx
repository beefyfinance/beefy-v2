import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { CardContent } from '../Card';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { selectBoostById, selectPreStakeOrActiveBoostIds } from '../../../data/selectors/boosts';
import { selectBoostedVaultMainPartner } from '../../../data/selectors/partners';
import { useAppSelector } from '../../../../store';
import { LinkIcon } from '../../../../components/LinkIcon';
import Twitter from '../../../../images/icons/twitter.svg';
import Telegram from '../../../../images/icons/telegram.svg';
import Discord from '../../../../images/icons/discord.svg';
import { selectBoostRewardsTokenEntity } from '../../../data/selectors/balance';
import { AddTokenToWallet } from '../AddTokenToWallet';

const useStyles = makeStyles(styles);
export const BoostCard = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boost = useAppSelector(state => selectBoostById(state, boostIds[0]));
  const partner = useAppSelector(state => selectBoostedVaultMainPartner(state, vaultId));
  const { text, social, website } = partner;
  const rewardToken = useAppSelector(state => selectBoostRewardsTokenEntity(state, boost.id));

  return (
    <div>
      <div className={classes.header}>
        <div className={classes.boostedBy}>
          {t('Vault-BoostedBy')}
          <span>{boost.name}</span>
        </div>
        <div className={classes.socials}>
          {website && <LinkButton href={website} text={t('Boost-PartnerLink-website')} />}
          {social.twitter && <LinkIcon id="twitter" logo={Twitter} href={social.twitter} />}
          {social.telegram && <LinkIcon id="telegram" logo={Telegram} href={social.telegram} />}
          {social.discord && <LinkIcon id="discord" logo={Discord} href={social.discord} />}
        </div>
      </div>
      <CardContent>
        <div className={classes.text}>{text}</div>
        <AddTokenToWallet token={rewardToken} chainId={boost.chainId} />
      </CardContent>
    </div>
  );
};
