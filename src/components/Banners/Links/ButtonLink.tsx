import { memo } from 'react';
import type { ButtonLinkProps } from './types.ts';
import { baseClass } from './styles.ts';
import { cx } from '@repo/styles/css';

export const ButtonLink = memo<ButtonLinkProps>(function ButtonLink({
  onClick,
  children,
  className,
}) {
  return (
    <span onClick={onClick} className={cx(baseClass, className)}>
      {children}
    </span>
  );
});
