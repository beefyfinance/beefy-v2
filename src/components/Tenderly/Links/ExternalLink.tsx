import { memo, type ReactNode } from 'react';
import { legacyMakeStyles } from '../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import OpenInNewRoundedIcon from '../../../images/icons/mui/OpenInNewRounded.svg?react';

const useStyles = legacyMakeStyles(styles);

export type ExternalLinkProps = {
  href: string;
  icon?: boolean;
  css?: CssStyles;
  children: ReactNode;
};

export const ExternalLink = memo(function ExternalLink({
  href,
  icon,
  css: cssProp,
  children,
}: ExternalLinkProps) {
  const classes = useStyles();
  return (
    <a className={css(styles.link, cssProp)} href={href} target="_blank">
      {children}
      {icon ?
        <OpenInNewRoundedIcon width={16} height={16} className={classes.icon} />
      : null}
    </a>
  );
});
