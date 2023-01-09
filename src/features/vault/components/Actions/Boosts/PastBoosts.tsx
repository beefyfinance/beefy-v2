import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import AnimateHeight from 'react-animate-height';
import { styles } from './styles';
import { askForNetworkChange, askForWalletConnection } from '../../../../data/actions/wallet';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../../data/selectors/wallet';
import {
  selectBoostById,
  selectIsVaultBoosted,
  selectPastBoostIdsWithUserBalance,
} from '../../../../data/selectors/boosts';
import { BoostEntity } from '../../../../data/entities/boost';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { Button } from '../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import { BoostPastActionCard } from './BoostPastActionCard';

const useStyles = makeStyles(styles);

export function PastBoosts({ vaultId }: { vaultId: BoostEntity['id'] }) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));
  const classes = useStyles({ isBoosted });
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const pastBoostsWithUserBalance = useAppSelector(state =>
    selectPastBoostIdsWithUserBalance(state, vaultId).map(boostId =>
      selectBoostById(state, boostId)
    )
  );
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );

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
            >
              {t('Network-Change', { network: chain.name })}
            </Button>
          ) : (
            pastBoostsWithUserBalance.map(boost => <BoostPastActionCard boost={boost} />)
          )
        ) : (
          <Button
            className={classes.button}
            fullWidth={true}
            borderless={true}
            onClick={() => dispatch(askForWalletConnection())}
          >
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </AnimateHeight>
    </div>
  );
}
