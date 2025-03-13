import { memo } from 'react';
import type { ExternalLinkProps } from './types.ts';
import { baseClass } from './styles.ts';
import { cx } from '@repo/styles/css';

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({
  href,
  children,
  className,
}) {
  return (
    <a href={href} target="_blank" className={cx(baseClass, className)}>
      {children}
    </a>
  );
});
