import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectIsOpenCover, selectIsVaultNexus } from '../../../data/selectors/partners';
import { OpenCoverCard } from '../OpenCoverCard';
import { NexusCard } from '../NexusCard';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface InsuraceCardProps {
  vaultId: VaultEntity['id'];
}

export const InsuranceCards = memo<InsuraceCardProps>(function InsuranceCards({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isOpenCover = useAppSelector(state => selectIsOpenCover(state, vaultId));
  const isNexus = useAppSelector(state => selectIsVaultNexus(state, vaultId));

  if (!isOpenCover && !isNexus) {
    return null;
  }

  return (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Insurance')}>
        {isNexus && <NexusCard />}
        {isOpenCover && <OpenCoverCard vaultId={vaultId} />}
      </Collapsable>
    </div>
  );
});
