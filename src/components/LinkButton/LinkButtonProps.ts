import { type CssStyles } from '@repo/styles/css';

export interface LinkButtonProps {
  href?: string;
  text?: string;
  type?: string;
  css?: CssStyles;
  hideIconOnMobile?: boolean;
}
