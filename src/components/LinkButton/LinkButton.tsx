import type { FC } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import OpenInNewRoundedIcon from '../../images/icons/mui/OpenInNewRounded.svg?react';
import CodeRoundedIcon from '../../images/icons/mui/CodeRounded.svg?react';
import InsertIcon from '../../images/icons/mui/InsertLink.svg?react';
import type { LinkButtonProps } from './LinkButtonProps.ts';
import { css } from '@repo/styles/css';
import { useBreakpoint } from '../MediaQueries/useBreakpoint.ts';
import { ExternalLink } from '../Links/ExternalLink.tsx';

const useStyles = legacyMakeStyles(styles);

export const LinkButton: FC<LinkButtonProps> = ({
  href,
  text,
  type,
  hideIconOnMobile,
  css: cssProp,
}) => {
  const classes = useStyles();
  const mobileView = useBreakpoint({ to: 'sm' });

  const shouldHideIcon = hideIconOnMobile && mobileView;
  return (
    <ExternalLink className={css(cssProp, styles.link)} href={href}>
      {type === 'code' && <CodeRoundedIcon fontSize="inherit" className={classes.icon} />}
      {type === 'link' && <InsertIcon fontSize="inherit" className={classes.icon} />}
      <span>{text}</span>
      {shouldHideIcon !== true && <OpenInNewRoundedIcon className={classes.icon} />}
    </ExternalLink>
  );
};
