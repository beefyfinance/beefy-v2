import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles';
import { useAppSelector } from '../../../../../../store';
import { memo } from 'react';
import { selectTransactVaultId } from '../../../../../data/selectors/transact';
import { selectAreFeesLoaded, selectFeesByVaultId } from '../../../../../data/selectors/fees';
import clsx from 'clsx';
import { formatLargePercent } from '../../../../../../helpers/format';
import { TextLoader } from '../../../../../../components/TextLoader';
import { PerformanceFees } from './PerformanceFees';
import { Label } from './Label';
import { Value } from './Value';
import { MaybeZapFees } from './ZapFees';
import { LabelCustomTooltip, LabelTooltip } from './LabelTooltip';

const useStyles = makeStyles(styles);

export type VaultFeesProps = {
  className?: string;
};
export const VaultFees = memo<VaultFeesProps>(function VaultFees({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);

  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.transactionFees}>
        <Label>
          {t('Transact-Fee-Deposit')} <LabelTooltip title={t('Transact-Fee-Deposit-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ? (
            fees ? (
              formatLargePercent(fees.deposit ?? 0, 2, '0%')
            ) : (
              '?'
            )
          ) : (
            <TextLoader placeholder={'0.0%'} />
          )}
        </Value>
        <Label>
          {t('Transact-Fee-Withdraw')} <LabelTooltip title={t('Transact-Fee-Withdraw-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ? (
            fees ? (
              formatLargePercent(fees.withdraw, 2, '0%')
            ) : (
              '?'
            )
          ) : (
            <TextLoader placeholder={'0.0%'} />
          )}
        </Value>
        <MaybeZapFees />
      </div>
      <div className={classes.performanceFees}>
        <Trans
          t={t}
          i18nKey={'Transact-Fee-Performance-Explainer'}
          components={{
            PerformanceTooltip: fees ? (
              <LabelCustomTooltip content={<PerformanceFees fees={fees} />} />
            ) : (
              <span />
            ),
          }}
        />
      </div>
    </div>
  );
});

export const WithdrawFees = memo<VaultFeesProps>(function WithdrawFees({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);
  return (
    <div className={clsx(classes.container, className)}>
      <div className={classes.transactionFees}>
        <Label>
          {t('Transact-Fee-Withdraw')} <LabelTooltip title={t('Transact-Fee-Withdraw-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ? (
            fees ? (
              formatLargePercent(fees.withdraw, 2, '0%')
            ) : (
              '?'
            )
          ) : (
            <TextLoader placeholder={'0.0%'} />
          )}
        </Value>
      </div>
    </div>
  );
});
