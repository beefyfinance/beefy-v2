import React from 'react';
import { Box, makeStyles, Divider, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { styles } from './styles';
import { useLastHarvest } from '../../hooks/useLastHarvest';
import { BeefyState } from '../../../../redux-types';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { DailyApyStats, YearlyApyStats } from '../../../../components/ApyStats';
import { ValueBlock } from '../../../../components/ValueBlock/ValueBlock';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards';

const useStyles = makeStyles(styles as any);

function VaultsStatsComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  //const lastHarvest = useLastHarvest(vaultId);
  const lastHarvest = 'never';
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  return (
    <Box className={classes.container}>
      <Grid spacing={6} container>
        <Grid item lg={8} xs={12}>
          <Box className={classes.stats}>
            <Box width={'33%'} className={classes.stat3}>
              <VaultTvl variant="large" vaultId={vaultId} />
            </Box>
            <Box className={classes.stat}>
              <Divider className={classes.divider} orientation="vertical" />
              <Box className={classes.stat3}>
                <YearlyApyStats variant="large" vaultId={vault.id} />
              </Box>
            </Box>
            <Box display="flex">
              <Divider className={classes.divider} orientation="vertical" />
              <Box className={classes.stat3}>
                <DailyApyStats variant="large" vaultId={vault.id} />
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Grid container className={classes.stats2}>
            <Grid item xs={6} className={classes.stat1}>
              <Box>
                <VaultDeposited variant="large" vaultId={vaultId} />
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
                      <ValueBlock
                        variant="large"
                        label={t('Vault-LastHarvest')}
                        value={lastHarvest}
                      />
                    </Box>
                  </Grid>
                )}
              </>
            ) : (
              <Grid item xs={6}>
                <Box>
                  <GovVaultRewards variant="large" vaultId={vaultId} />
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
