import { type FunctionComponent, memo, type SVGProps } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { ExternalLink } from '../Links/ExternalLink.tsx';

export type IconButtonLinkProps = {
  href: string;
  text: string;
  Icon: FunctionComponent<
    SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;
  css?: CssStyles;
  textCss?: CssStyles;
  iconCss?: CssStyles;
};

export const IconButtonLink = memo(function IconButtonLink({
  href,
  text,
  Icon,
  css: cssProp,
  textCss,
  iconCss,
}: IconButtonLinkProps) {
  return (
    <ExternalLink className={css(styles.link, cssProp)} href={href} title={text}>
      <Icon className={css(styles.icon, iconCss)} />
      <span className={css(textCss)}>{text}</span>
    </ExternalLink>
  );
});
