import React, { memo, useCallback, useEffect } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { getSingleAssetSrc } from '../../../../helpers/singleAssetSrc';
import { Button } from '../../../../components/Button';
import type { VaultEntity } from '../../../data/entities/vault';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import {} from '../../../data/selectors/platforms';
import { formatBigDecimals } from '../../../../helpers/format';
import { selectCurrentChainId, selectWalletAddressIfKnown } from '../../../data/selectors/wallet';
import { fetchAllMigrators, migratorExecute, migratorUpdate } from '../../../data/actions/migrator';
import {
  selectHasMigrationByVaultId,
  selectMigratorById,
  selectShouldInitMigration,
  selectUserBalanceToMigrateByVaultId,
} from '../../../data/selectors/migration';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { selectTransactMigrateAllQuote } from '../../../data/selectors/transact';
import { selectChainById } from '../../../data/selectors/chains';
import { askForNetworkChange } from '../../../data/actions/wallet';

const useStyles = makeStyles(styles);

interface MigrationProps {
  vaultId: VaultEntity['id'];
}

export const Migration = memo<MigrationProps>(function Migration({ vaultId }) {
  const dispatch = useAppDispatch();
  const shouldInitMigration = useAppSelector(selectShouldInitMigration);
  const vaultHasMigration = useAppSelector(state => selectHasMigrationByVaultId(state, vaultId));
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);

  useEffect(() => {
    if (shouldInitMigration) {
      dispatch(fetchAllMigrators());
    }
  }, [dispatch, shouldInitMigration]);

  if (walletAddress && vaultHasMigration) return <Migrator vaultId={vaultId} />;

  return null;
});

const Migrator = memo<MigrationProps>(function Migrator({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const dispatch = useAppDispatch();
  const userBalanceToMigrate = useAppSelector(state =>
    selectUserBalanceToMigrateByVaultId(state, vaultId)
  );
  const migrator = useAppSelector(state => selectMigratorById(state, vault.migrationId));
  const migrateAllQuote = useAppSelector(selectTransactMigrateAllQuote);

  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );

  useEffect(() => {
    if (userBalanceToMigrate.eq(BIG_ZERO)) {
      dispatch(migratorUpdate({ vaultId }));
    }
  }, [dispatch, userBalanceToMigrate, vaultId]);

  const handleMigrateAll = useCallback(() => {
    dispatch(migratorExecute({ vaultId }));
  }, [dispatch, vaultId]);

  const handleConnectedChain = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: vault.chainId }));
  }, [dispatch, vault.chainId]);

  if (userBalanceToMigrate.gt(0)) {
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <img className={classes.icon} src={getSingleAssetSrc(migrator.icon)} />
          <div>
            <div className={classes.subTitle}>{migrator.name}</div>
            <div className={classes.title}>{t('Migration-Title')}</div>
          </div>
        </div>
        <div className={classes.content}>
          <div>
            {t('Migration-Text', {
              balance: formatBigDecimals(userBalanceToMigrate, 4),
              migrator: migrator.name,
            })}
          </div>
          {isWalletOnVaultChain ? (
            <Button
              disabled={!migrateAllQuote}
              onClick={handleMigrateAll}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Migration-Action')}
            </Button>
          ) : (
            <Button
              onClick={handleConnectedChain}
              variant="success"
              fullWidth={true}
              borderless={true}
            >
              {t('Network-Change', { network: chain.name })}
            </Button>
          )}
        </div>
      </div>
    );
  }
  return null;
});
