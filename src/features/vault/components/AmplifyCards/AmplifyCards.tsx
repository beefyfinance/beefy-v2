import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultOlive } from '../../../data/selectors/partners';
import { Olive } from '../OliveCard';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface AmplifyCardsProps {
  vaultId: VaultEntity['id'];
}

export const AmplifyCards = memo<AmplifyCardsProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isOlive = useAppSelector(state => selectIsVaultOlive(state, vaultId));

  return isOlive ? (
    <div className={classes.container}>
      <Collapsable
        openByDefault={true}
        titleClassName={classes.title}
        title={t('Yield Amplification')}
      >
        <Olive />
      </Collapsable>
    </div>
  ) : null;
});
