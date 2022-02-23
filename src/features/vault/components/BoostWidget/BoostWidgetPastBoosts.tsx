import { Box, Button, makeStyles, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
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
const useStyles = makeStyles(styles as any);

export function BoostWidgetPastBoosts({ vaultId }: { vaultId: BoostEntity['id'] }) {
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const pastBoostsWithUserBalance = useSelector((state: BeefyState) =>
    selectPastBoostIdsWithUserBalance(state, vaultId).map(boostId =>
      selectBoostById(state, boostId)
    )
  );
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );

  const [startStepper, isStepping, Stepper] = useStepper(vaultId, () => {});

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
      <Box display="flex" alignItems="center" style={{ marginBottom: '24px' }}>
        <img
          alt="fire"
          src={require(`../../../../images/fire.png`).default}
          className={classes.boostImg}
        />
        <Typography className={classes.h1white}>{t('Boost-Expired')}</Typography>
        &nbsp;
        <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
        <Button></Button>
      </Box>
      <AnimateHeight duration={500} height="auto">
        {pastBoostsWithUserBalance.map(boost => (
          <div className={classes.expiredBoostContainer} key={boost.id}>
            <Typography className={classes.h2} style={{ textTransform: 'none' }}>
              {boost.name}&nbsp;{t('Filter-Boost')}
            </Typography>
            <Button
              onClick={() => handleExit(boost)}
              disabled={isStepping}
              className={classes.button}
              style={{ marginBottom: 0 }}
              fullWidth={true}
            >
              {t('Boost-Button-Claim-Unstake')}
            </Button>
          </div>
        ))}
      </AnimateHeight>
      <Stepper />
    </div>
  );
}
