import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { memo } from 'react';
import { AssetsImage } from '../../../../../../components/AssetsImage/AssetsImage.tsx';
import { formatLargeUsd } from '../../../../../../helpers/format.ts';
import type { BreakdownMode, CalculatedBreakdownData } from '../../types.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { useTranslation } from 'react-i18next';
import { TokenAmount } from '../../../../../../components/TokenAmount/TokenAmount.tsx';

const useStyles = legacyMakeStyles(styles);

export type BreakdownTableProps = {
  mode: BreakdownMode;
  breakdown: CalculatedBreakdownData;
  css?: CssStyles;
};

export const BreakdownTable = memo(function BreakdownTable({
  mode,
  breakdown,
  css: cssProp,
}: BreakdownTableProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { chainId, assets, token } = breakdown;
  const valueField = `${mode}Value` as const;
  const amountField = `${mode}Amount` as const;

  return (
    <div className={css(styles.table, cssProp)}>
      <div className={css(styles.row, styles.header)}>
        <div className={classes.cell}>{t('Vault-LpBreakdown-Asset')}</div>
        <div className={classes.cell}>{t('Vault-LpBreakdown-TokenAmount')}</div>
        <div className={classes.cell}>{t('Vault-LpBreakdown-Value')}</div>
      </div>
      {assets.map(asset => (
        <div key={asset.address} className={classes.row}>
          <div className={css(styles.cell, styles.asset)}>
            <AssetsImage css={styles.icon} chainId={chainId} assetSymbols={[asset.symbol]} />{' '}
            {asset.symbol}
          </div>
          <div className={classes.cell}>
            <TokenAmount
              amount={asset[amountField]}
              decimals={asset.decimals}
              css={styles.tokenAmount}
            />
          </div>
          <div className={classes.cell}>{formatLargeUsd(asset[valueField])}</div>
        </div>
      ))}
      <div className={css(styles.row, styles.footer)}>
        <div className={css(styles.cell, styles.asset)}>
          <AssetsImage
            css={styles.icon}
            chainId={chainId}
            assetSymbols={assets.map(asset => asset.symbol)}
          />{' '}
          LP
        </div>
        <div className={classes.cell}>
          <TokenAmount
            amount={breakdown[amountField]}
            decimals={token.decimals}
            css={styles.tokenAmount}
          />
        </div>
        <div className={classes.cell}>{formatLargeUsd(breakdown[valueField])}</div>
      </div>
    </div>
  );
});
