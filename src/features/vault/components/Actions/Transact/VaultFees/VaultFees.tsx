import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { TextLoader } from '../../../../../../components/TextLoader/TextLoader.tsx';
import { formatLargePercent } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectAreFeesLoaded, selectFeesByVaultId } from '../../../../../data/selectors/fees.ts';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { Label } from './Label.tsx';
import { LabelCustomTooltip, LabelTooltip } from './LabelTooltip.tsx';
import { PerformanceFees } from './PerformanceFees.tsx';
import { styles } from './styles.ts';
import { Value } from './Value.tsx';
import { MaybeZapFees } from './ZapFees.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultFeesProps = {
  css?: CssStyles;
};
export const VaultFees = memo(function VaultFees({ css: cssProp }: VaultFeesProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);

  return (
    <div className={css(styles.container, cssProp)}>
      <div className={classes.transactionFees}>
        <Label>
          {t('Transact-Fee-Deposit')} <LabelTooltip title={t('Transact-Fee-Deposit-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ?
            fees ?
              formatLargePercent(fees.deposit ?? 0, 2, '0%')
            : '?'
          : <TextLoader placeholder={'0.0%'} />}
        </Value>
        <Label>
          {t('Transact-Fee-Withdraw')} <LabelTooltip title={t('Transact-Fee-Withdraw-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ?
            fees ?
              formatLargePercent(fees.withdraw, 2, '0%')
            : '?'
          : <TextLoader placeholder={'0.0%'} />}
        </Value>
        <MaybeZapFees />
      </div>
      <div className={classes.performanceFees}>
        <Trans
          t={t}
          i18nKey={'Transact-Fee-Performance-Explainer'}
          components={{
            PerformanceTooltip:
              fees ? <LabelCustomTooltip tooltip={<PerformanceFees fees={fees} />} /> : <span />,
          }}
        />
      </div>
    </div>
  );
});

export const WithdrawFees = memo(function WithdrawFees({ css: cssProp }: VaultFeesProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const fees = useAppSelector(state => selectFeesByVaultId(state, vaultId));
  const areFeesLoaded = useAppSelector(selectAreFeesLoaded);
  return (
    <div className={css(styles.container, cssProp)}>
      <div className={classes.transactionFees}>
        <Label>
          {t('Transact-Fee-Withdraw')} <LabelTooltip title={t('Transact-Fee-Withdraw-Explainer')} />
        </Label>
        <Value>
          {areFeesLoaded ?
            fees ?
              formatLargePercent(fees.withdraw, 2, '0%')
            : '?'
          : <TextLoader placeholder={'0.0%'} />}
        </Value>
        <MaybeZapFees />
      </div>
    </div>
  );
});
