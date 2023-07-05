import React, { memo, useEffect } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetSrc } from '../../../../helpers/singleAssetSrc';
import { Button } from '../../../../components/Button';
import type { VaultEntity } from '../../../data/entities/vault';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { formatBigDecimals } from '../../../../helpers/format';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet';
import { fetchAllMigrators, fetchConicStakedBalance } from '../../../data/actions/migrator';
import {
  selectHasMigrationByVaultId,
  selectShouldInitMigration,
  selectUserBalanceToMigrateByVaultId,
} from '../../../data/selectors/migration';
import { BIG_ZERO } from '../../../../helpers/big-number';

const useStyles = makeStyles(styles);

interface ConicMigrationProps {
  vaultId: VaultEntity['id'];
}

export const ConicMigration = memo<ConicMigrationProps>(function ConicMigration({ vaultId }) {
  const dispatch = useAppDispatch();
  const shouldInitMigration = useAppSelector(selectShouldInitMigration);
  const vaultHasMigration = useAppSelector(state => selectHasMigrationByVaultId(state, vaultId));
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);

  useEffect(() => {
    if (shouldInitMigration) {
      dispatch(fetchAllMigrators());
    }
  }, [dispatch, shouldInitMigration]);

  if (walletAddress && vaultHasMigration) return <ConicMigrationContent vaultId={vaultId} />;

  return null;
});

const ConicMigrationContent = memo<ConicMigrationProps>(function ConicMigrationContent({
  vaultId,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const dispatch = useAppDispatch();
  const userBalanceToMigrate = useAppSelector(state =>
    selectUserBalanceToMigrateByVaultId(state, vaultId)
  );
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));

  useEffect(() => {
    if (userBalanceToMigrate.eq(BIG_ZERO)) {
      dispatch(fetchConicStakedBalance({ vaultId }));
    }
  }, [dispatch, userBalanceToMigrate, vaultId]);

  if (userBalanceToMigrate.gt(0)) {
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <img className={classes.icon} src={getSingleAssetSrc('CNC')} />
          <div>
            <div className={classes.subTitle}>{platform.name}</div>
            <div className={classes.title}>{t('Migration-Title')}</div>
          </div>
        </div>
        <div className={classes.content}>
          <div>
            {t('Migration-Text', {
              balance: formatBigDecimals(userBalanceToMigrate, 4),
              platform: platform.name,
            })}
          </div>
          <Button variant="success" fullWidth={true} borderless={true}>
            {t('Migration-Action')}
          </Button>
        </div>
      </div>
    );
  }
  return null;
});
