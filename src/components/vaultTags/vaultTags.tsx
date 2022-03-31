import React, { memo, useMemo } from 'react';
import { makeStyles, Typography, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { VaultEntity } from '../../features/data/entities/vault';
import { useSelector } from 'react-redux';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { BeefyState } from '../../redux-types';
import { selectIsVaultPreStakedOrBoosted } from '../../features/data/selectors/boosts';
import {
  selectIsVaultLacucina,
  selectIsVaultMoonpot,
} from '../../features/data/selectors/partners';

const useStyles = makeStyles(styles as any);
const _DisplayTags = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );
  const isMoonpot = useSelector((state: BeefyState) => selectIsVaultMoonpot(state, vaultId));
  const isLaCucina = useSelector((state: BeefyState) => selectIsVaultLacucina(state, vaultId));
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
      {isBoosted && (
        <div className={classes.spacingMobile} key={'boost'}>
          <Typography className={classes.tags}>{t('VaultTag-Boost')}</Typography>
        </div>
      )}
      {isMoonpot && (
        <div className={classes.spacingMobile} key={'pots'}>
          <Box className={classes.tags}>
            <img
              className={classes.tagImage}
              src={require('../../images/pots.svg').default}
              alt="pots"
            />
            <Typography className={classes.text}>{t('VaultTag-Moonpot')}</Typography>
          </Box>
        </div>
      )}
      {isLaCucina && (
        <div className={classes.spacingMobile} key={'laCucina'}>
          <Box className={classes.tags}>
            <img
              className={classes.tagImage}
              src={require('../../images/lacucina.svg').default}
              alt="laCucina"
            />
            <Typography className={classes.text}>{t('VaultTag-LaCucina')}</Typography>
          </Box>
        </div>
      )}
      {vault.tags.map(item => (
        <div className={classes.spacingMobile} key={item}>
          <Typography className={classes.tags}>{item in labels ? labels[item] : item}</Typography>
        </div>
      ))}
    </>
  );
};

export const DisplayTags = memo(_DisplayTags);
