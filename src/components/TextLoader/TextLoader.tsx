import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type TextLoaderProps = {
  placeholder: string;
  css?: CssStyles;
};

export const TextLoader = memo(function TextLoader({ placeholder, css: cssProp }: TextLoaderProps) {
  const classes = useStyles();

  return (
    <span className={css(styles.holder, cssProp)}>
      <span className={classes.placeholder}>{placeholder}</span>
      <span className={classes.loader} />
    </span>
  );
});
