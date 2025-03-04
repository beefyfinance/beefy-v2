import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { css, type CssStyles } from '@repo/styles/css';
import { styles } from './styles.ts';
import { VaultLabelledStat } from '../VaultLabelledStat/VaultLabelledStat.tsx';

export type VaultValueStatProps = {
  label: string;
  tooltip?: ReactNode;
  value: ReactNode;
  subValue?: ReactNode;
  css?: CssStyles;
  blur?: boolean;
  loading: boolean;
  boosted?: boolean;
  showLabel?: boolean;
  shouldTranslate?: boolean;
  contentCss?: CssStyles;
  triggerCss?: CssStyles;
  labelCss?: CssStyles;
};
export const VaultValueStat = memo(function VaultValueStat({
  label,
  tooltip,
  value,
  subValue,
  blur,
  loading,
  boosted,
  showLabel = true,
  shouldTranslate = false,
  css: cssProp,
  contentCss,
  triggerCss,
  labelCss,
}: VaultValueStatProps) {
  const { t } = useTranslation();

  return (
    <VaultLabelledStat
      triggerCss={css.raw(
        styles.value,
        triggerCss,
        blur && styles.blurValue,
        boosted && styles.boostedValue
      )}
      showLabel={showLabel}
      label={t(label)}
      tooltip={loading ? null : tooltip}
      css={cssProp}
      contentCss={contentCss}
      labelCss={labelCss}
      subValue={subValue}
      blur={blur}
      boosted={boosted}
    >
      {loading ? '...' : <>{shouldTranslate && typeof value === 'string' ? t(value) : value}</>}
    </VaultLabelledStat>
  );
});
