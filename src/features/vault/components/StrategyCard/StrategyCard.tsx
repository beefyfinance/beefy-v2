import { makeStyles, Typography, Box } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { config } from '../../../../config/config';
import { formatApy } from '../../../../helpers/format';
import { LinkButton } from '../../../../components/LinkButton';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import shield from './shield.svg';
import { stratText } from './stratText';
interface StrategyCardProps {
  stratType?: any;
  stratAddr?: any;
  vaultAddr?: any;
  apy?: any;
  audit?: any;
  network?: any;
  platform?: any;
  assets?: any;
  want?: any;
  vamp?: any;
  isBoosted?: any;
  boostedData?: any;
  isGovVault?: any;
}

const useStyles = makeStyles(styles as any);
function StrategyCardComponent({
  stratType,
  stratAddr,
  vaultAddr,
  apy,
  audit,
  network,
  platform,
  assets,
  want,
  vamp,
  boostedData,
  isBoosted,
  isGovVault,
}: StrategyCardProps) {
  const classes = useStyles();
  const t = useTranslation().t;

  const values: Record<string, any> = {};

  values.totalApy = apy.totalApy;

  if (apy.vaultApr) {
    values.vaultApr = apy.vaultApr;
    values.vaultDaily = apy.vaultApr / 365;
  }

  if (apy.tradingApr) {
    values.tradingApr = apy.tradingApr;
  }

  if (isGovVault) {
    values.totalApy = values.vaultApr / 1;
    values.totalDaily = values.vaultApr / 365;
  }

  if (isBoosted) {
    values.boostApr = boostedData.apr;
    values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
  }

  const formatted = Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const formattedValue = key.toLowerCase().includes('daily')
        ? formatApy(value, 4, '-' /*, 4*/) // TODO: fix this formatApy
        : formatApy(value, 2, '-');
      return [key, formattedValue];
    })
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle title={t('Vault-Strategy')} />
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton
              type="code"
              href={`${config[network].explorerUrl}/address/${stratAddr}`}
              text={t('Strat-Address')}
            />
          </div>
          <div className={classes.cardAction}>
            <LinkButton
              type="code"
              href={`${config[network].explorerUrl}/address/${vaultAddr}`}
              text={t('Strat-AddressVault')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="body1" className={classes.text}>
          {stratText(stratType, platform, assets, want, vamp, t)}
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
            {apy.vaultApr && (
              <div className={classes.apy}>
                <Typography className={classes.apyLabel}>{t('Vault-VaultApr')}</Typography>
                <Typography variant="h5" className={classes.apyValue}>
                  {formatted.vaultApr}
                </Typography>
              </div>
            )}
            {apy.tradingApr > 0 && (
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
          {audit ? (
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
