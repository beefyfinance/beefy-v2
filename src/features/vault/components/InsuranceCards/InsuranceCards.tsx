import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultInsurace, selectIsVaultNexus } from '../../../data/selectors/partners';
import { InsuraceCard } from '../InsuraceCard';
import { NexusCard } from '../NexusCard';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface InsuraceCardProps {
  vaultId: VaultEntity['id'];
}

export const InsuranceCards = memo<InsuraceCardProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isInsurace = useAppSelector(state => selectIsVaultInsurace(state, vaultId));
  const isNexus = useAppSelector(state => selectIsVaultNexus(state, vaultId));

  if (!isInsurace && !isNexus) {
    return null;
  }

  return (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Insurance')}>
        {isNexus && <NexusCard />}
        {isInsurace && <InsuraceCard />}
      </Collapsable>
    </div>
  );
});
