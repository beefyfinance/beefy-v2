import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type SafetyScoreProps = {
  score: number;
  size: 'sm' | 'md';
  align?: 'left' | 'right';
  css?: CssStyles;
};

export const SafetyScore = memo(function SafetyScore({
  score,
  size = 'sm',
  align = 'left',
  css: cssProp,
}: SafetyScoreProps) {
  const classes = useStyles();

  return (
    <div
      className={css(
        styles.container,
        cssProp,
        size === 'md' && styles.withSizeMedium,
        align === 'right' && styles.withRightAlign
      )}
    >
      <div className={classes.barsContainer}>
        <div className={css(styles.bar, styles.sm, styles.green)} />
        <div className={css(styles.bar, styles.md, score >= 6.4 && styles.green)} />
        <div className={css(styles.bar, styles.lg, score >= 7.5 && styles.green)} />
      </div>
    </div>
  );
});
