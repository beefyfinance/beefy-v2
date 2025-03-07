import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';
import { styles } from './styles.ts';

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
    <a className={css(styles.link, cssProp)} target="_blank" href={href}>
      {label}
    </a>
  );
});
