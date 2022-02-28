import { makeStyles, Typography, Box } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formattedTotalApy } from '../../../../helpers/format';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import shield from './shield.svg';
import { stratText } from './stratText';
import { BeefyState } from '../../../../redux-types';
import { useSelector } from 'react-redux';
import { selectVaultTotalApy } from '../../../data/selectors/apy';
import { isGovVault, VaultEntity } from '../../../data/entities/vault';
import { selectVaultById, selectVaultStrategyAddress } from '../../../data/selectors/vaults';
import { selectChainById } from '../../../data/selectors/chains';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';

const useStyles = makeStyles(styles as any);
function StrategyCardComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const t = useTranslation().t;

  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const values = useSelector((state: BeefyState) => selectVaultTotalApy(state, vaultId));
  const formatted = formattedTotalApy(values);
  const stratAddr = useSelector((state: BeefyState) => selectVaultStrategyAddress(state, vaultId));
  const platform = useSelector((state: BeefyState) => selectPlatformById(state, vault.platformId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const isVaultAudited = vault.risks.includes('AUDIT');
  if (isGovVault(vault)) {
    return <></>;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle title={t('Vault-Strategy')} />
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton
              type="code"
              href={`${chain.explorerUrl}/address/${stratAddr}`}
              text={t('Strat-Address')}
            />
          </div>
          <div className={classes.cardAction}>
            <LinkButton
              type="code"
              href={`${chain.explorerUrl}/address/${vault.contractAddress}`}
              text={t('Strat-AddressVault')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="body1" className={classes.text} style={{ whiteSpace: 'pre-line' }}>
          {stratText(vault.strategyType, platform.name, vault.assetIds, vault.name, vault.name, t)}
        </Typography>
        <div className={classes.apysContainer}>
          <Typography variant="h5" className={classes.apyTitle}>
            {t('Vault-ApyBreakdown')}
          </Typography>
          <div className={classes.apys}>
            <div className={classes.apy}>
              <Typography className={classes.apyLabel}>{t('Vault-ApyTotal')}</Typography>
              <Typography variant="h5" className={classes.apyValue}>
                {isBoosted ? formatted.boostedTotalApy : formatted.totalApy}
              </Typography>
            </div>
            {values.vaultApr && (
              <div className={classes.apy}>
                <Typography className={classes.apyLabel}>{t('Vault-VaultApr')}</Typography>
                <Typography variant="h5" className={classes.apyValue}>
                  {formatted.vaultApr}
                </Typography>
              </div>
            )}
            {values.tradingApr > 0 && (
              <div className={classes.apy}>
                <Typography className={classes.apyLabel}>{t('Vault-AprTrading')}</Typography>
                <Typography variant="h5" className={classes.apyValue}>
                  {formatted.tradingApr}
                </Typography>
              </div>
            )}
            {isBoosted && (
              <div className={classes.apy}>
                <Typography className={classes.apyLabel}>{t('Vault-AprBoost')}</Typography>
                <Typography variant="h5" className={classes.apyValue}>
                  {formatted.boostApr}
                </Typography>
              </div>
            )}
          </div>
        </div>
        <div className={classes.audits}>
          {isVaultAudited ? (
            <Box className={classes.audit}>
              <img alt="Audited" src={shield} className={classes.auditIcon} />
              <Typography className={classes.auditLabel}>{t('Vault-Auditd')}</Typography>
            </Box>
          ) : null}

          <Box className={classes.audit}>
            <img alt="Community Audited" src={shield} className={classes.auditIcon} />
            <Typography className={classes.auditLabel}>{t('Vault-AuditdCommunity')}</Typography>
          </Box>
        </div>
      </CardContent>
    </Card>
  );
}

export const StrategyCard = React.memo(StrategyCardComponent);
