import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { selectBoostById, selectPreStakeOrActiveBoostIds } from '../../../data/selectors/boosts';
import { selectBoostedVaultMainPartner } from '../../../data/selectors/partners';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);
export const BoostCard = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boost = useAppSelector(state => selectBoostById(state, boostIds[0]));
  const partner = useAppSelector(state => selectBoostedVaultMainPartner(state, vaultId));
  const { text, social, website } = partner;

  return (
    <Card>
      <CardHeader>
        <div className={classes.boostedBy}>{t('Vault-BoostedBy')}</div>
        <div>
          <CardTitle title={boost.name} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={website} text={t('Boost-PartnerLink-website')} />
          </div>
          {Object.keys(social).map(net => (
            <div key={net} className={classes.cardAction}>
              <LinkButton href={social[net]} text={t(`Boost-PartnerLink-${net}`)} />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className={classes.text}>{text}</p>
      </CardContent>
    </Card>
  );
};
