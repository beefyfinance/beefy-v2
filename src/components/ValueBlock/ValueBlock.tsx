import { memo, type ReactNode } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { styles } from './styles.ts';
import { ContentLoading } from '../ContentLoading/ContentLoading.tsx';
import { IconWithTooltip } from '../Tooltip/IconWithTooltip.tsx';

const useStyles = legacyMakeStyles(styles);

type ValueBlockProps = {
  label: ReactNode;
  value: ReactNode;
  textContent?: boolean;
  tooltip?: ReactNode;
  usdValue?: ReactNode;
  loading?: boolean;
  blurred?: boolean;
  labelCss?: CssStyles;
  valueCss?: CssStyles;
  priceCss?: CssStyles;
};

export const ValueBlock = memo(function ValueBlock({
  label,
  value,
  textContent = true,
  tooltip,
  usdValue,
  loading = false,
  blurred = false,
  labelCss,
  valueCss,
  priceCss,
}: ValueBlockProps) {
  const classes = useStyles();
  return (
    <>
      <div className={classes.tooltipLabel}>
        <div className={css(styles.label, labelCss)}>{label}</div>
        {!loading && tooltip && <IconWithTooltip tooltip={tooltip} iconCss={styles.tooltipIcon} />}
      </div>
      {textContent ?
        <div className={css(styles.value, valueCss, blurred && styles.blurred)}>
          {!loading ?
            <>{blurred ? '....' : value}</>
          : <ContentLoading />}
        </div>
      : !loading ?
        <>{blurred ? '....' : value}</>
      : <div className={classes.noTextContentLoader}>
          <ContentLoading />
        </div>
      }

      {usdValue && (
        <div className={css(styles.price, priceCss, blurred && styles.blurred)}>
          {!loading ?
            <>{blurred ? '...' : usdValue}</>
          : <ContentLoading />}
        </div>
      )}
    </>
  );
});
