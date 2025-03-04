import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles, cx } from '@repo/styles/css';
import ChevronRight from '../../../../../../images/icons/mui/ChevronRight.svg?react';

const useStyles = legacyMakeStyles(styles);

export type ButtonAdornmentProps = {
  children: ReactNode;
  onClick?: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >['onClick'];
  css?: CssStyles;
};
export const ButtonAdornment = memo(function ButtonAdornment({
  children,
  onClick,
  css: cssProp,
}: ButtonAdornmentProps) {
  const classes = useStyles();

  return (
    <button type="button" className={css(styles.button, cssProp)} onClick={onClick}>
      {children}
      <ChevronRight className={cx('button-arrow', classes.arrow)} />
    </button>
  );
});
