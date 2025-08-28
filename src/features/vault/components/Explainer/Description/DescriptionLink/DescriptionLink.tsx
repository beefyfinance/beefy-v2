import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import { styles } from './styles.ts';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';

export type DescriptionLinkProps = {
  href: string;
  label: string;
  css?: CssStyles;
};

export const DescriptionLink = memo(function DescriptionLink({
  href,
  label,
  css: cssProp,
}: DescriptionLinkProps) {
  return (
    <ExternalLink className={css(styles.link, cssProp)} href={href}>
      {label}
    </ExternalLink>
  );
});
