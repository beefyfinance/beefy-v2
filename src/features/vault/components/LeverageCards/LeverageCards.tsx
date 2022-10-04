import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectIsVaultQidao } from '../../../data/selectors/partners';
import { QiDao } from '../QiDaoCard';

import { styles } from './styles';

const useStyles = makeStyles(styles);

interface LeverageCardsProps {
  vaultId: VaultEntity['id'];
}

export const LeverageCards = memo<LeverageCardsProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const isQidao = useAppSelector(state => selectIsVaultQidao(state, vaultId));

  return isQidao ? (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Leverage')}>
        <QiDao />
      </Collapsable>
    </div>
  ) : null;
});
