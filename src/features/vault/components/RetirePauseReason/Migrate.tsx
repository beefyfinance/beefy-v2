import { memo, useCallback, useEffect, useMemo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { AlertWarning } from '../../../../components/Alerts';
import { makeStyles } from '@material-ui/core';
import { Button, ButtonLink } from '../../../../components/Button';
import { Theme } from '@material-ui/core/styles';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
  selectWalletAddressIfKnown,
} from '../../../data/selectors/wallet';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectUserVaultDepositInDepositTokenExcludingBoosts } from '../../../data/selectors/balance';
import { BIG_ZERO } from '../../../../helpers/big-number';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { selectChainById } from '../../../data/selectors/chains';
import { useTranslation } from 'react-i18next';
import { Step } from '../../../../components/Steps/types';
import { walletActions } from '../../../data/actions/wallet-actions';
import { selectErc20TokenByAddress } from '../../../data/selectors/tokens';
import { useStepper } from '../../../../components/Steps/hooks';
import { selectIsApprovalNeededForMigrate } from '../../../data/selectors/wallet-actions';
import { fetchAllowanceAction } from '../../../data/actions/allowance';

const useStyles = makeStyles((theme: Theme) => ({
  message: {},
  actions: {
    marginTop: '16px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  button: {
    [theme.breakpoints.down('xs')]: {
      flexGrow: 1,
    },
  },
}));

export type MigrateProps = {
  fromVaultId: VaultEntity['id'];
  toVaultId: VaultEntity['id'];
  contractAddress?: string;
  message: string;
  className?: string;
};

export const Migrate = memo<MigrateProps>(function Migrate({
  fromVaultId,
  toVaultId,
  contractAddress,
  message,
  className,
}) {
  if (contractAddress) {
    return (
      <MigrateAutomatic
        className={className}
        toVaultId={toVaultId}
        message={message}
        fromVaultId={fromVaultId}
        contractAddress={contractAddress}
      />
    );
  }

  return <MigrateManual toVaultId={toVaultId} message={message} className={className} />;
});

type MigrateAutomaticProps = MigrateProps;
const MigrateAutomatic = memo<MigrateAutomaticProps>(function MigrateAutomatic({
  fromVaultId,
  toVaultId,
  contractAddress,
  message,
  className,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const fromVault = useAppSelector(state => selectVaultById(state, fromVaultId));
  const [startStepper, isStepping, Stepper] = useStepper(fromVault.chainId);
  const mooToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, fromVault.chainId, fromVault.earnContractAddress)
  );
  const wantedChainId = fromVault.chainId;
  const currentChainId = useAppSelector(selectCurrentChainId);
  const wantedChain = useAppSelector(state => selectChainById(state, wantedChainId));
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isCorrectChain = currentChainId === wantedChainId;
  const walletAddress = useAppSelector(selectWalletAddressIfKnown);
  const withdrawableTokens = useAppSelector(state =>
    selectUserVaultDepositInDepositTokenExcludingBoosts(state, fromVaultId, walletAddress)
  );
  const needsApproval = useAppSelector(state =>
    selectIsApprovalNeededForMigrate(state, fromVaultId, contractAddress, walletAddress)
  );
  const migrateDisabled = useMemo(() => {
    return isStepping || !isWalletConnected || !isCorrectChain || withdrawableTokens.lte(BIG_ZERO);
  }, [isWalletConnected, isCorrectChain, withdrawableTokens, isStepping]);

  const handleConnect = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleSwitch = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: wantedChainId }));
  }, [dispatch, wantedChainId]);

  const handleMigrate = useCallback(() => {
    const steps: Step[] = [];

    if (needsApproval) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(mooToken, contractAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'migrate',
      message: t('Vault-TxnConfirm', { type: t('Migration-noun') }),
      action: walletActions.migrate(fromVaultId, toVaultId, contractAddress),
      pending: false,
    });

    startStepper(steps);
  }, [fromVaultId, toVaultId, contractAddress, mooToken, needsApproval, t, startStepper]);

  useEffect(() => {
    if (walletAddress) {
      dispatch(
        fetchAllowanceAction({
          chainId: wantedChainId,
          spenderAddress: contractAddress,
          tokens: [mooToken],
        })
      );
    }
  }, [dispatch, wantedChainId, contractAddress, mooToken, walletAddress]);

  return (
    <AlertWarning className={className}>
      <div className={classes.message}>{message}</div>
      <div className={classes.actions}>
        <ButtonLink to={`/vault/${toVaultId}`} variant="light" className={classes.button}>
          {t('Migrate-ViewNewVault')}
        </ButtonLink>
        {!isWalletConnected ? (
          <Button variant="success" className={classes.button} onClick={handleConnect}>
            {t('Migrate-ConnectWallet')}
          </Button>
        ) : !isCorrectChain ? (
          <Button variant="success" className={classes.button} onClick={handleSwitch}>
            {t('Migrate-SwitchNetwork', { network: wantedChain.name })}
          </Button>
        ) : (
          <Button
            variant="success"
            className={classes.button}
            onClick={handleMigrate}
            disabled={migrateDisabled}
          >
            {t('Migrate-Now')}
          </Button>
        )}
      </div>
      <Stepper />
    </AlertWarning>
  );
});

type MigrateManualProps = {
  toVaultId: MigrateProps['toVaultId'];
  message: MigrateProps['message'];
  className: MigrateProps['className'];
};
const MigrateManual = memo<MigrateManualProps>(function MigrateManual({
  toVaultId,
  message,
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <AlertWarning className={className}>
      <div className={classes.message}>{message}</div>
      <div className={classes.actions}>
        <ButtonLink to={`/vault/${toVaultId}`} variant="light" className={classes.button}>
          {t('Migrate-ViewNewVault')}
        </ButtonLink>
      </div>
    </AlertWarning>
  );
});
