import { ElementType, memo, PropsWithChildren } from 'react';
import { CustomVariant } from '@material-ui/core/styles/createTypography';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type TextProps = PropsWithChildren<{
  as?: ElementType;
  variant?: CustomVariant | 'inherit';
  className?: string;
  noWrap?: boolean;
}>;

/**
 * Replacement for Typography that supports our custom named styles
 * Instead of this you can use {...theme.typography["subline-lg"]} to apply the same styles to classes
 */
export const Text = memo<TextProps>(function Text({
  variant = 'inherit',
  children = null,
  as = 'p',
  className,
  noWrap = false,
}) {
  const classes = useStyles();
  const Component = as;

  return (
    <Component
      className={clsx(classes[variant], className, {
        [classes.noWrap]: noWrap,
      })}
    >
      {children}
    </Component>
  );
});
