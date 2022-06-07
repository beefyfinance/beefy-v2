import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AnimateHeight from 'react-animate-height';
import { styles } from './styles';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { BeefyState } from '../../../../redux-types';
import { useStepper } from '../../../../components/Steps/hooks';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../data/selectors/wallet';
import {
  selectBoostById,
  selectIsVaultBoosted,
  selectPastBoostIdsWithUserBalance,
} from '../../../data/selectors/boosts';
import { Step } from '../../../../components/Steps/types';
import { walletActions } from '../../../data/actions/wallet-actions';
import { BoostEntity } from '../../../data/entities/boost';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { Button } from '../../../../components/Button';

const useStyles = makeStyles(styles);

export function BoostWidgetPastBoosts({ vaultId }: { vaultId: BoostEntity['id'] }) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const pastBoostsWithUserBalance = useSelector((state: BeefyState) =>
    selectPastBoostIdsWithUserBalance(state, vaultId).map(boostId =>
      selectBoostById(state, boostId)
    )
  );
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );

  const [startStepper, isStepping, Stepper] = useStepper(vaultId);

  const handleExit = (boost: BoostEntity) => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    steps.push({
      step: 'claim-unstake',
      message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
      action: walletActions.exitBoost(boost),
      pending: false,
    });

    startStepper(steps);
  };

  if (pastBoostsWithUserBalance.length <= 0) {
    return <></>;
  }

  return (
    <div className={classes.containerExpired}>
      <div className={classes.title}>
        <span>
          <Trans
            t={t}
            i18nKey="Boost-ExpiredBoost"
            components={{ white: <span className={classes.titleWhite} /> }}
          />
        </span>
      </div>
      <AnimateHeight duration={500} height="auto">
        {isWalletConnected ? (
          !isWalletOnVaultChain ? (
            <Button
              onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
              className={classes.button}
              fullWidth={true}
              borderless={true}
              variant="success"
              disabled={isStepping}
            >
              {t('Network-Change', { network: chain.name.toUpperCase() })}
            </Button>
          ) : (
            pastBoostsWithUserBalance.map(boost => (
              <div className={classes.expiredBoostContainer} key={boost.id}>
                <div className={classes.expiredBoostName}>
                  {t('Boost-NameBoost', { name: boost.name })}
                </div>
                <Button
                  onClick={() => handleExit(boost)}
                  disabled={isStepping}
                  className={classes.button}
                  fullWidth={true}
                  borderless={true}
                >
                  {t('Boost-Button-Claim-Unstake')}
                </Button>
              </div>
            ))
          )
        ) : (
          <Button
            className={classes.button}
            fullWidth={true}
            borderless={true}
            variant="success"
            onClick={() => dispatch(askForWalletConnection())}
            disabled={isStepping}
          >
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </AnimateHeight>
      <Stepper />
    </div>
  );
}
