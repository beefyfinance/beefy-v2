import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { config } from '../../../../config/config';
import { formatApy } from '../../../../helpers/format';
import LinkButton from '../../../../components/LinkButton';
import Card from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import CardContent from '../Card/CardContent';
import CardTitle from '../Card/CardTitle';
import styles from './styles';
import shield from './shield.svg';
import stratText from './stratText';

const useStyles = makeStyles(styles);

const StrategyCard = ({
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
}) => {
  const classes = useStyles();
  const t = useTranslation().t;

  return (
    <Card>
      <CardHeader>
        <CardTitle title={t('Vault-Strategy')} />
        <div className={classes.cardActions}>
          <div className={classes.cardAction}>
            <LinkButton
              href={`${config[network].explorerUrl}/address/${stratAddr}`}
              text={t('Strat-Address')}
            />
          </div>
          <div className={classes.cardAction}>
            <LinkButton
              href={`${config[network].explorerUrl}/address/${vaultAddr}`}
              text={t('Strat-AddressVault')}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography className={classes.text}>
          {stratText(stratType, platform, assets, want, vamp, t)}
        </Typography>
        <div className={classes.apysContainer}>
          <Typography className={classes.apyTitle}>{t('Vault-ApyBreakdown')}</Typography>
          <div className={classes.apys}>
            <div className={classes.apy}>
              <Typography className={classes.apyValue}>{formatApy(apy.totalApy, '-')}</Typography>
              <Typography className={classes.apyLabel}>{t('Vault-ApyTotal')}</Typography>
            </div>
            {apy.vaultApr && (
              <div className={classes.apy}>
                <Typography className={classes.apyValue}>{formatApy(apy.vaultApr, '-')}</Typography>
                <Typography className={classes.apyLabel}>{t('Vault-AprFarm')}</Typography>
              </div>
            )}
            {apy.tradingApr && (
              <div className={classes.apy}>
                <Typography className={classes.apyValue}>
                  {formatApy(apy.tradingApr, '-')}
                </Typography>
                <Typography className={classes.apyLabel}>{t('Vault-AprTrading')}</Typography>
              </div>
            )}
            {apy.boostApr && (
              <div className={classes.apy}>
                <Typography className={classes.apyValue}>{formatApy(apy.boostApr, '-')}</Typography>
                <Typography className={classes.apyLabel}>{t('Vault-AprBoost')}</Typography>
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
            <Typography className={classes.auditLabel}>
																							{t('Vault-AuditdCommunity')}</Typography>
          </Box>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyCard;
