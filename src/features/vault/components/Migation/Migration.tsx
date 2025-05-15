import { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../components/Button/Button.tsx';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { getSingleAssetSrc } from '../../../../helpers/singleAssetSrc.ts';
import { isEmpty } from '../../../../helpers/utils.ts';
import type { MigrationConfig } from '../../../data/reducers/wallet/migration-types.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import {
  fetchAllMigrators,
  migratorExecute,
  migratorUpdate,
} from '../../../data/actions/migrator.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { isVaultActive } from '../../../data/entities/vault.ts';
import {
  selectMigrationIdsByVaultId,
  selectMigratorById,
  selectShouldInitMigration,
  selectUserBalanceToMigrateByVaultId,
} from '../../../data/selectors/migration.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddress,
  selectWalletAddressIfKnown,
} from '../../../data/selectors/wallet.ts';
import { ActionConnect, ActionSwitch } from '../Actions/Transact/CommonActions/CommonActions.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface MigrationProps {
  vaultId: VaultEntity['id'];
}

export const Migration = memo(function Migration({ vaultId }: MigrationProps) {
  const dispatch = useAppDispatch();
  const shouldInitMigration = useAppSelector(selectShouldInitMigration);
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const migrationIds = useAppSelector(state => selectMigrationIdsByVaultId(state, vaultId));
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  useEffect(() => {
    if (shouldInitMigration) {
      dispatch(fetchAllMigrators());
    }
  }, [dispatch, shouldInitMigration]);

  if (!isEmpty(migrationIds) && walletAddress && isVaultActive(vault)) {
    return (
      <>
        {migrationIds.map(migrationId => {
          return <Migrator key={migrationId} vaultId={vaultId} migrationId={migrationId} />;
        })}
      </>
    );
  }
  return null;
});

const Migrator = memo(function Migrator({
  vaultId,
  migrationId,
}: {
  migrationId: MigrationConfig['id'];
} & MigrationProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const dispatch = useAppDispatch();
  const { initialized, balance } = useAppSelector(state =>
    selectUserBalanceToMigrateByVaultId(state, vaultId, migrationId)
  );
  const migrator = useAppSelector(state => selectMigratorById(state, migrationId));
  const walletAddress = useAppSelector(selectWalletAddress);

  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );

  useEffect(() => {
    if (balance.eq(BIG_ZERO) && !initialized && walletAddress) {
      dispatch(migratorUpdate({ vaultId, migrationId, walletAddress }));
    }
  }, [dispatch, migrationId, balance, vaultId, walletAddress, initialized]);

  const handleMigrateAll = useCallback(() => {
    dispatch(migratorExecute({ vaultId, t, migrationId }));
  }, [dispatch, migrationId, t, vaultId]);

  if (balance.gt(0)) {
    return (
      <div className={classes.container}>
        <div className={classes.header}>
          <img className={classes.icon} alt={migrator.id} src={getSingleAssetSrc(migrator.icon)} />
          <div>
            <div className={classes.subTitle}>{migrator.name}</div>
            <div className={classes.title}>{t('Migration-Title')}</div>
          </div>
        </div>
        <div className={classes.content}>
          <div>
            {t('Migration-Text', {
              balance: formatTokenDisplayCondensed(balance, 18),
              migrator: migrator.name,
            })}
          </div>
          {!isWalletConnected ?
            <ActionConnect />
          : isWalletOnVaultChain ?
            <Button onClick={handleMigrateAll} variant="success" fullWidth={true} borderless={true}>
              {t('Migration-Action')}
            </Button>
          : <ActionSwitch chainId={vault.chainId} />}
        </div>
      </div>
    );
  }
  return null;
});
