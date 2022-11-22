import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import { selectVaultDepositFee } from '../../../../../data/selectors/vaults';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';
import { selectAreFeesLoaded, selectFeesByVaultId } from '../../../../../data/selectors/fees';
import clsx from 'clsx';
import { formatPercent } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { VaultFee } from '../../../../../data/reducers/fees';
import { InterestTooltipContent } from '../../../../../home/components/Vault/components/InterestTooltipContent';
import { IconWithTooltip } from '../../../../../../components/Tooltip';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent';

const useStyles = makeStyles(styles);

type PerformanceFeesProps = { fees: VaultFee };
const performanceFeeLabels = {
  stakers: 'Transact-Fee-Holder',
  treasury: 'Transact-Fee-Treasury',
  strategist: 'Transact-Fee-Developers',
  call: 'Transact-Fee-HarvestFee',
};
const PerformanceFees = memo<PerformanceFeesProps>(function ({ fees }) {
  const { t } = useTranslation();
  const rows = Object.entries(performanceFeeLabels)
    .filter(([key]) => key in fees)
    .map(([key, label]) => ({
      label: t(label),
      value: `${formatPercent(fees[key], 2, '0%')}`,
    }));

  rows.push({
    label: t('Transact-Fee-TotalFee'),
    value: `${formatPercent(fees.total, 2, '0%')}`,
  });

  return <InterestTooltipContent rows={rows} />;
});

export type VaultFeesProps = {
  className?: string;
};
export const VaultFees = memo<VaultFeesProps>(function VaultFees({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);
  const deposit = useAppSelector(state => selectVaultDepositFee(state, vaultId));

  if (!fees) {
    return;
  }

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.transactionFees}>
        <div className={classes.label}>
          {t('Transact-Fee-Deposit')}{' '}
          <IconWithTooltip
            triggerClass={classes.tooltipTrigger}
            content={<BasicTooltipContent title={t('Transact-Fee-Deposit-Explainer')} />}
          />
        </div>
        <div className={classes.value}>
          {areFeesLoaded ? (
            fees ? (
              fees.deposit !== undefined ? (
                formatPercent(fees.deposit, 2, '0%')
              ) : (
                deposit
              )
            ) : (
              '?'
            )
          ) : (
            <TextLoader placeholder={'0.0%'} />
          )}
        </div>
        <div className={classes.label}>
          {t('Transact-Fee-Withdraw')}{' '}
          <IconWithTooltip
            triggerClass={classes.tooltipTrigger}
            content={<BasicTooltipContent title={t('Transact-Fee-Withdraw-Explainer')} />}
          />
        </div>
        <div className={classes.value}>
          {areFeesLoaded ? (
            fees ? (
              formatPercent(fees.withdraw, 2, '0%')
            ) : (
              '?'
            )
          ) : (
            <TextLoader placeholder={'0.0%'} />
          )}
        </div>
      </div>
      <div className={classes.performanceFees}>
        <Trans
          t={t}
          i18nKey={'Transact-Fee-Performance-Explainer'}
          components={{
            PerformanceTooltip: fees ? (
              <IconWithTooltip
                triggerClass={classes.tooltipTrigger}
                content={<PerformanceFees fees={fees} />}
              />
            ) : undefined,
          }}
        />
      </div>
    </div>
  );
});
