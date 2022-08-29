import { Box, Grid, makeStyles } from '@material-ui/core';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { InterestTooltipContent } from '../../../home/components/Vault/components/InterestTooltipContent';
import { IconWithTooltip } from '../../../../components/Tooltip';
import { formatPercent } from '../../../../helpers/format';
import { selectVaultDepositFee } from '../../../data/selectors/vaults';
import {
  selectAreFeesLoaded,
  selectFeesByVaultId,
  selectShouldInitFees,
} from '../../../data/selectors/fees';
import { fetchFees } from '../../../data/actions/fees';
import ContentLoader from 'react-content-loader';
import { VaultFee } from '../../../data/reducers/fees';

const useStyles = makeStyles(styles);

type PerformanceFeesProps = { fees: VaultFee };

const PerformanceFees = memo<PerformanceFeesProps>(function ({ fees }) {
  const { t } = useTranslation();
  const rows = [];

  if ('stakers' in fees) {
    rows.push({
      label: t('Fee-Holder'),
      value: `${formatPercent(fees.stakers, 2, '0%')}`,
      last: false,
    });
  }

  if ('treasury' in fees) {
    rows.push({
      label: t('Fee-Treasury'),
      value: `${formatPercent(fees.treasury, 2, '0%')}`,
      last: false,
    });
  }

  if ('strategist' in fees) {
    rows.push({
      label: t('Fee-Developers'),
      value: `${formatPercent(fees.strategist, 2, '0%')}`,
      last: false,
    });
  }

  if ('strategist' in fees) {
    rows.push({
      label: t('Fee-HarvestFee'),
      value: `${formatPercent(fees.call, 2, '0%')}`,
      last: false,
    });
  }

  rows.push({
    label: t('Fee-TotalFee'),
    value: `${formatPercent(fees.total, 2, '0%')}`,
    last: true,
  });

  return <InterestTooltipContent rows={rows} />;
});

const FeeLoading = memo(function () {
  return (
    <ContentLoader
      viewBox="0 0 48 16"
      width="48"
      height="16"
      backgroundColor="rgba(255, 255, 255, 0.12)"
      foregroundColor="rgba(255, 255, 255, 0.32)"
    >
      <rect x="0" y="0" rx="8" ry="8" width="48" height="16" />
    </ContentLoader>
  );
});

export const FeeBreakdown = memo(({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const shouldInitFees = useAppSelector(selectShouldInitFees);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);
  const deposit = useAppSelector(state => selectVaultDepositFee(state, vaultId));

  useEffect(() => {
    if (shouldInitFees) {
      dispatch(fetchFees());
    }
  }, [dispatch, shouldInitFees]);

  return (
    <Box mt={3} p={2} className={classes.feeContainer}>
      <Grid container>
        <Grid item xs={12}>
          <div className={classes.title}>{t('Fee-Title')}</div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.label}>{t('Fee-Deposit')}</div>
          <div className={classes.value}>{deposit}</div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.label}>{t('Fee-Withdraw')}</div>
          <div className={classes.value}>
            {areFeesLoaded ? fees ? formatPercent(fees.withdraw, 2, '0%') : '?' : <FeeLoading />}
          </div>
        </Grid>
        <Grid item xs={6}>
          <div className={classes.label} style={{ marginRight: '4px' }}>
            {t('Fee-Performance')}
            {fees ? (
              <IconWithTooltip
                triggerClass={classes.tooltipTrigger}
                content={<PerformanceFees fees={fees} />}
              />
            ) : null}
          </div>
          <div className={classes.value}>
            {areFeesLoaded ? fees ? formatPercent(fees.total, 2, '0%') : '?' : <FeeLoading />}
          </div>
        </Grid>
        <Grid item xs={12}>
          <Box pt={1} className={classes.smallText}>
            {t('Fee-PerformExt')}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});
