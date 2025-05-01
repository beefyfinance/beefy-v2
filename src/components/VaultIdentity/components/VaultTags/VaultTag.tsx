import { styles } from './styles.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import type { ReactNode } from 'react';
import { forwardRef, memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import { DivWithTooltip, type DivWithTooltipProps } from '../../../Tooltip/DivWithTooltip.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultTagProps = {
  css?: CssStyles;
  icon?: ReactNode;
  text: ReactNode;
  order?: 'icon-text' | 'text-icon';
};

export const VaultTag = memo(
  forwardRef<HTMLDivElement, VaultTagProps>(function VaultTag({ icon, text, css: cssProp }, ref) {
    const classes = useStyles();
    return (
      <div className={css(styles.vaultTag, cssProp)} ref={ref}>
        {icon ?
          <div className={classes.vaultTagIcon}>{icon}</div>
        : null}
        {text ?
          <div className={classes.vaultTagText}>{text}</div>
        : null}
      </div>
    );
  })
);

export type VaultTagWithTooltipProps = VaultTagProps &
  Omit<DivWithTooltipProps, 'children' | 'className'>;

export const VaultTagWithTooltip = memo(
  forwardRef<HTMLDivElement, VaultTagWithTooltipProps>(function VaultTagWithTooltip(
    { icon, text, css: cssProp, order = 'icon-text', ...rest },
    ref
  ) {
    const classes = useStyles();

    return (
      <DivWithTooltip
        className={css(styles.vaultTag, cssProp, order === 'text-icon' && styles.inverted)}
        ref={ref}
        {...rest}
      >
        {icon ?
          <div className={classes.vaultTagIcon}>{icon}</div>
        : null}
        {text ?
          <div className={classes.vaultTagText}>{text}</div>
        : null}
      </DivWithTooltip>
    );
  })
);
