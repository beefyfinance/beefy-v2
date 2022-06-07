import React, { memo, useMemo } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { VaultEntity } from '../../features/data/entities/vault';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsVaultPreStakedOrBoosted } from '../../features/data/selectors/boosts';
import { selectIsVaultMoonpot } from '../../features/data/selectors/partners';
import { useAppSelector } from '../../store';

const useStyles = makeStyles(styles as any);
const _DisplayTags = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectIsVaultPreStakedOrBoosted(state, vaultId));
  const isMoonpot = useAppSelector(state => selectIsVaultMoonpot(state, vaultId));
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
      {vault.tags.map(item => (
        <div className={classes.spacingMobile} key={item}>
          <Typography className={classes.tags}>{item in labels ? labels[item] : item}</Typography>
        </div>
      ))}
    </>
  );
};

export const DisplayTags = memo(_DisplayTags);
