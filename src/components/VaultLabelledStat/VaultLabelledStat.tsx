import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultLabelledStatProps = {
  label: string;
  showLabel?: boolean;
  tooltip?: ReactNode;
  children: ReactNode;
  css?: CssStyles;
  triggerCss?: CssStyles;
  labelCss?: CssStyles;
  subValue?: ReactNode;
  blur?: boolean;
  boosted?: boolean;
  contentCss?: CssStyles;
};
export const VaultLabelledStat = memo(function VaultLabelledStat({
  label,
  children,
  tooltip,
  showLabel = true,
  css: cssProp,
  triggerCss,
  labelCss,
  subValue,
  blur,
  boosted,
  contentCss,
}: VaultLabelledStatProps) {
  const classes = useStyles();
  const lgUp = useBreakpoint({ from: 'lg' });

  return (
    <div className={css(cssProp)}>
      {!lgUp && showLabel ? (
        <div className={classes.label}>
          <div className={css(styles.labelText, labelCss)}>{label}</div>
        </div>
      ) : null}
      {tooltip ? (
        <div className={css(contentCss)}>
          <DivWithTooltip className={css(triggerCss)} tooltip={tooltip}>
            {children}
          </DivWithTooltip>
          {subValue && (
            <div
              className={css(
                styles.subValue,
                blur && styles.blurValue,
                boosted && styles.lineThroughValue
              )}
            >
              {subValue}
            </div>
          )}
        </div>
      ) : (
        <div className={css(contentCss)}>
          <div className={css(triggerCss)}>{children}</div>
          {subValue && (
            <div
              className={css(
                styles.subValue,
                blur && styles.blurValue,
                boosted && styles.lineThroughValue
              )}
            >
              {subValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
