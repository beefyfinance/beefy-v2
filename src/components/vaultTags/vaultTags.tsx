import React, { memo, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { VaultEntity } from '../../features/data/entities/vault';
import { useSelector } from 'react-redux';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { BeefyState } from '../../redux-types';
import { selectIsVaultPreStakedOrBoosted } from '../../features/data/selectors/boosts';
import { selectIsVaultMoonpot } from '../../features/data/selectors/partners';

const useStyles = makeStyles(styles);
const _DisplayTags = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );
  const isMoonpot = useSelector((state: BeefyState) => selectIsVaultMoonpot(state, vaultId));
  const labels = useMemo(
    () => ({
      low: t('VaultTag-LowRisk'),
      'deposits-paused': t('VaultTag-Paused'),
      eol: t('VaultTag-Inactive'),
      bluechip: t('VaultTag-Bluechip'),
    }),
    [t]
  );

  return (
    <>
      {isBoosted && <div className={classes.tag}>{t('VaultTag-Boost')}</div>}
      {isMoonpot && (
        <div className={classes.tag}>
          <img
            className={classes.tagImage}
            src={require('../../images/pots.svg').default}
            alt="pots"
          />
          {t('VaultTag-Moonpot')}
        </div>
      )}
      {vault.tags.map(item => (
        <div className={classes.tag} key={item}>
          {item in labels ? labels[item] : item}
        </div>
      ))}
    </>
  );
};

export const DisplayTags = memo(_DisplayTags);
