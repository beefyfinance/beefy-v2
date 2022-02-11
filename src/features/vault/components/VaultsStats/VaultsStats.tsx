import React from 'react';
import { Box, makeStyles, Typography, Divider, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import { useSelector } from 'react-redux';
import {
  calcDaily,
  formatApy,
  formatUsd,
  BIG_ZERO,
  formattedTotalApy,
  formatBigUsd,
  formatBigNumber,
} from '../../../../helpers/format';
import { styles } from './styles';
import { useLastHarvest } from '../../hooks/useLastHarvest';
import { BeefyState } from '../../../../redux-types';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
  selectUserVaultDepositInToken,
  selectUserVaultDepositInUsd,
} from '../../../data/selectors/balance';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import { selectVaultTvl } from '../../../data/selectors/tvl';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';
import { DailyApyStats, YearlyApyStats } from '../../../home/components/ApyStats';

const useStyles = makeStyles(styles as any);

const ValueText = ({ value }) => {
  const classes = useStyles();
  return (
    <>
      {value ? (
        <Typography variant="h4" className={classes.value}>
          {value}
        </Typography>
      ) : (
        <ApyStatLoader />
      )}
    </>
  );
};

const ValueTached = ({ value }) => {
  const classes = useStyles();
  return <>{value ? <span className={classes.tached}>{value}</span> : <ApyStatLoader />}</>;
};

const ValuePrice = ({ value }) => {
  const classes = useStyles();
  return (
    <>{value ? <Typography className={classes.price}>{value}</Typography> : <ApyStatLoader />}</>
  );
};

function VaultsStatsComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const lastHarvest = useLastHarvest(vaultId);
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const deposited = useSelector((state: BeefyState) =>
    selectUserVaultDepositInToken(state, vaultId)
  );
  const depositedUsd = useSelector((state: BeefyState) =>
    selectUserVaultDepositInUsd(state, vaultId)
  );
  const poolRewards = useSelector((state: BeefyState) =>
    isGovVault(vault) ? selectGovVaultPendingRewardsInToken(state, vaultId) : BIG_ZERO
  );
  const poolRewardsUsd = useSelector((state: BeefyState) =>
    isGovVault(vault) ? selectGovVaultPendingRewardsInUsd(state, vaultId) : BIG_ZERO
  );
  const vaultTvl = useSelector((state: BeefyState) => selectVaultTvl(state, vaultId));
  const vaultTotalApy = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));

  const values = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));
  const formatted = formattedTotalApy(values);
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));

  ///const rewardsEarned = poolRewards.balance.isGreaterThan(0) ? poolRewards.shares : BIG_ZERO;

  return (
    <Box className={classes.container}>
      <Grid spacing={6} container>
        <Grid item lg={8} xs={12}>
          <Box className={classes.stats}>
            {/**TVL */}
            <Box width={'33%'}>
              <Typography className={classes.label}>{t('TVL')}</Typography>
              <Typography>
                <ValueText value={formatBigUsd(vaultTvl)} />
              </Typography>
            </Box>
            <Box className={classes.stat}>
              <Divider className={classes.divider} orientation="vertical" />
              <Box>
                <YearlyApyStats vaultId={vault.id} />
              </Box>
            </Box>
            <Box display="flex">
              <Divider className={classes.divider} orientation="vertical" />
              <Box>
                <DailyApyStats vaultId={vault.id} />
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Grid container className={classes.stats2}>
            <Grid item xs={6} className={classes.stat1}>
              <Box>
                <Typography className={classes.label}>{t('Vault-deposited')}</Typography>
                <Typography>
                  <ValueText value={formatBigNumber(deposited)} />
                </Typography>
                {depositedUsd.isGreaterThan(0) && (
                  <Typography>
                    <ValuePrice value={formatBigUsd(depositedUsd)} />
                  </Typography>
                )}
              </Box>
            </Grid>
            {(isGovVault(vault) || lastHarvest !== 'never') && (
              <Divider flexItem={true} className={classes.divider1} orientation="vertical" />
            )}
            {!isGovVault(vault) ? (
              <>
                {lastHarvest !== 'never' && (
                  <Grid item xs={6}>
                    <Box>
                      <Typography className={classes.label}>{t('Vault-LastHarvest')}</Typography>
                      <Typography>
                        <ValueText value={lastHarvest} />
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={6}>
                <Box>
                  <Typography className={classes.label}>{t('Vault-rewards')}</Typography>
                  <Typography>
                    <ValueText value={formatBigNumber(poolRewards)} />
                  </Typography>
                  {poolRewardsUsd.isGreaterThan(0) && (
                    <Typography>
                      <ValuePrice value={formatBigUsd(poolRewardsUsd)} />
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export const VaultsStats = React.memo(VaultsStatsComponent);
