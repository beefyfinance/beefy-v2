import type { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { SvgIconComponent } from '@material-ui/icons';

const useStyles = makeStyles(styles);

interface LinkIconProps {
  logo: string | SvgIconComponent;
  alt: string;
  href: string;
}

export const LinkIcon: FC<LinkIconProps> = ({ href, logo, alt }) => {
  const classes = useStyles();
  const IconComponent = typeof logo === 'string' ? 'img' : logo;

  return (
    <a className={classes.link} href={href} target="_blank" rel="noopener noreferrer">
      {typeof logo === 'string' ? (
        <img alt={alt} className={classes.icon} src={logo} />
      ) : (
        <IconComponent className={classes.svgIcon} />
      )}
    </a>
  );
};
