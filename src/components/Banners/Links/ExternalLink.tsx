import { memo } from 'react';
import type { ExternalLinkProps } from './types.ts';
import { baseClass } from './styles.ts';
import { cx } from '@repo/styles/css';
import { ExternalLink as BaseExternalLink } from '../../Links/ExternalLink.tsx';

export const ExternalLink = memo<ExternalLinkProps>(function ExternalLink({
  href,
  children,
  className,
}) {
  return (
    <BaseExternalLink href={href} className={cx(baseClass, className)}>
      {children}
    </BaseExternalLink>
  );
});
