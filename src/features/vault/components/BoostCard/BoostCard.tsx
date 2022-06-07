import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { selectBoostById, selectPreStakeOrActiveBoostIds } from '../../../data/selectors/boosts';
import { selectBoostedVaultMainPartner } from '../../../data/selectors/partners';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles as any);
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
        <Typography className={classes.boostedBy}>{t('Vault-BoostedBy')}</Typography>
        <div style={{ display: 'flex' }}>
          <CardTitle title={boost.name} subtitle={''} />
        </div>
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton href={website} text={'Website'} />
          </div>
          {Object.keys(social).map(net => {
            return (
              <div key={net} className={classes.cardAction}>
                <LinkButton href={social[net]} text={net} />
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>{text}</Typography>
      </CardContent>
    </Card>
  );
};
