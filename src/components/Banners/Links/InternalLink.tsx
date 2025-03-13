import { memo } from 'react';
import type { InternalLinkProps } from './types.ts';
import { Link } from 'react-router';
import { baseClass } from './styles.ts';
import { cx } from '@repo/styles/css';

export const InternalLink = memo<InternalLinkProps>(function InternalLink({
  to,
  children,
  className,
}) {
  return (
    <Link to={to} className={cx(baseClass, className)}>
      {children}
    </Link>
  );
});
