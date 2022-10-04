import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultMoonpot } from '../../../data/selectors/partners';
import { MoonpotCard } from '../MoonportCard';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface GamesCardsProps {
  vaultId: VaultEntity['id'];
}

export const GamesCards = memo<GamesCardsProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMoonpot = useAppSelector(state => selectIsVaultMoonpot(state, vaultId));

  return isMoonpot ? (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Saving-Games')}>
        <MoonpotCard />
      </Collapsable>
    </div>
  ) : null;
});
