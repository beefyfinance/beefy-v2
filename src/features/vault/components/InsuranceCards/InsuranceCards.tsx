import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultInsurace, selectIsVaultSolace } from '../../../data/selectors/partners';
import { InsuraceCard } from '../InsuraceCard';
import { NexusCard } from '../NexusCard';
import { SolaceCard } from '../SolaceCard';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface InsuraceCardProps {
  vaultId: VaultEntity['id'];
}

export const InsuranceCards = memo<InsuraceCardProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isInsurace = useAppSelector(state => selectIsVaultInsurace(state, vaultId));
  const isSolace = useAppSelector(state => selectIsVaultSolace(state, vaultId));

  return (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Insurance')}>
        <NexusCard />
        {isInsurace && <InsuraceCard />}
        {isSolace && <SolaceCard />}
      </Collapsable>
    </div>
  );
});
