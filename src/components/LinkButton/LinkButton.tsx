import type { FC } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import InsertIcon from '@material-ui/icons/InsertLink';
import type { LinkButtonProps } from './LinkButtonProps';
import clsx from 'clsx';
import type { Theme } from '@material-ui/core';

const useStyles = makeStyles(styles);

export const LinkButton: FC<LinkButtonProps> = ({
  href,
  text,
  type,
  hideIconOnMobile,
  className,
}) => {
  const classes = useStyles();

  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });

  const shouldHideIcon = hideIconOnMobile && mobileView;
  return (
    <a
      className={clsx(className, classes.link)}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {type === 'code' && <CodeRoundedIcon fontSize="inherit" className={classes.icon} />}
      {type === 'link' && <InsertIcon fontSize="inherit" className={classes.icon} />}
      <span>{text}</span>
      {shouldHideIcon !== true && (
        <OpenInNewRoundedIcon fontSize="inherit" className={classes.icon} />
      )}
    </a>
  );
};
