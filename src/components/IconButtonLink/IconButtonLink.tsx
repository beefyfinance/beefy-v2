import { type FunctionComponent, memo, type SVGProps } from 'react';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

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
    <a className={css(styles.link, cssProp)} href={href} target="_blank" title={text}>
      <Icon className={css(styles.icon, iconCss)} />
      <span className={css(textCss)}>{text}</span>
    </a>
  );
});
