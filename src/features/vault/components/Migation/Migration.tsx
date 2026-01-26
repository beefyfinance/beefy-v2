import { memo, useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '../../../../components/Button/Button.tsx';
import { formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { migratorExecute, migratorLoad, migratorUpdate } from '../../../data/actions/migrator.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectMigrationIdsByVaultId,
  selectMigrationVaultUserState,
  selectMigratorById,
} from '../../../data/selectors/migration.ts';
import { selectWalletAddressIfKnown } from '../../../data/selectors/wallet.ts';
import { ActionConnectSwitch } from '../Actions/Transact/CommonActions/CommonActions.tsx';
import { styles } from './styles.ts';
import { selectIsStepperStepping } from '../../../data/selectors/stepper.ts';
import { styled } from '@repo/styles/jsx';
import {
  selectVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../data/selectors/vaults.ts';

const useStyles = legacyMakeStyles(styles);

interface MigrationProps {
  vaultId: VaultEntity['id'];
}

export const Migration = memo(function Migration({ vaultId }: MigrationProps) {
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const migrationIds = useAppSelector(state => selectMigrationIdsByVaultId(state, vaultId));
  const strategyAddress = useAppSelector(state =>
    selectVaultStrategyAddressOrUndefined(state, vaultId)
  );

  if (!walletAddress || !migrationIds || !migrationIds.length || !strategyAddress) {
    return null;
  }

  return migrationIds.map(migrationId => {
    return (
      <WithMigrator
        key={migrationId}
        vaultId={vaultId}
        migrationId={migrationId}
        walletAddress={walletAddress}
      />
    );
  });
});

type MigratorProps = {
  migrationId: string;
  vaultId: VaultEntity['id'];
  walletAddress: string;
};

const WithMigrator = memo(function WithMigrator(props: MigratorProps) {
  const dispatch = useAppDispatch();
  const { migrationId } = props;
  const migrator = useAppSelector(state => selectMigratorById(state, migrationId));
  const shouldLoad = migrator === undefined;

  useEffect(() => {
    if (shouldLoad) {
      dispatch(migratorLoad({ migrationId }));
    }
  }, [migrationId, dispatch, shouldLoad]);

  if (migrator?.status !== 'fulfilled') {
    return null;
  }

  return <Migrator {...props} />;
});

const Migrator = memo(function Migrator({ vaultId, migrationId, walletAddress }: MigratorProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userState = useAppSelector(state =>
    selectMigrationVaultUserState(state, migrationId, vaultId, walletAddress)
  );
  const migrator = useAppSelector(state => selectMigratorById(state, migrationId));
  const isBusy = useAppSelector(selectIsStepperStepping);
  const { chainId } = useAppSelector(state => selectVaultById(state, vaultId));

  useEffect(() => {
    const staleAfter = 60_000; // 1 minute
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const shouldUpdate = () => {
      if (isBusy || !isMounted) {
        return false;
      }
      return (
        !userState ||
        (userState.status !== 'pending' &&
          Date.now() - userState.lastRequest.timestamp > staleAfter)
      );
    };

    const doUpdate = () => {
      if (shouldUpdate()) {
        dispatch(migratorUpdate({ vaultId, migrationId, walletAddress }))
          .finally(waitAndPoll)
          .catch(e => {
            console.error('Error updating migrator data', e);
          });
      } else if (isMounted) {
        waitAndPoll();
      }
    };

    const waitAndPoll = () => {
      if (!isMounted) {
        return;
      }

      timeoutId = setTimeout(doUpdate, staleAfter);
    };

    doUpdate();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };
  }, [dispatch, migrationId, userState, vaultId, walletAddress, isBusy]);

  const handleMigrateAll = useCallback(() => {
    if (walletAddress) {
      dispatch(migratorExecute({ vaultId, t, migrationId, walletAddress }));
    }
  }, [dispatch, migrationId, t, vaultId, walletAddress]);

  if (
    migrator?.status !== 'fulfilled' ||
    !userState ||
    !userState.lastFulfilled ||
    !userState.data.balance.gt(0)
  ) {
    return null;
  }

  const { name, icon } = migrator;
  const {
    status,
    data: { balance, symbol },
  } = userState;
  const isUpdating = status === 'pending';

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <img className={classes.icon} alt="" aria-hidden="true" src={icon} />
        <div>
          <div className={classes.subTitle}>{name}</div>
          <div className={classes.title}>{t('Migration-Title')}</div>
        </div>
      </div>
      <div className={classes.content}>
        <div>
          <Trans
            t={t}
            i18nKey="Migration-Text"
            components={{ Balance: <Balance updating={isUpdating} /> }}
            values={{
              balance: formatTokenDisplayCondensed(balance, 18),
              migrator: name,
              symbol: symbol || 'LP tokens',
            }}
          />
        </div>
        <ActionConnectSwitch chainId={chainId}>
          <Button
            onClick={handleMigrateAll}
            variant="cta"
            fullWidth={true}
            borderless={true}
            disabled={isBusy || isUpdating}
          >
            {t('Migration-Action')}
          </Button>
        </ActionConnectSwitch>
      </div>
    </div>
  );
});

const Balance = styled('span', {
  base: {
    opacity: '1',
    transition: 'opacity 500ms ease-in-out',
  },
  variants: {
    updating: {
      true: {
        animation: 'fadeUpdating 2000ms ease-in-out infinite',
        opacity: '0.8',
      },
    },
  },
});
