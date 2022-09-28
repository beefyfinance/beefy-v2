import React from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface LinkIconProps {
  logo: string;
  id: string;
  href;
}

export const LinkIcon: React.FC<LinkIconProps> = ({ href, logo, id }) => {
  const classes = useStyles();
  return (
    <a className={classes.link} href={href} target="_blank" rel="noopener noreferrer">
      <img alt={id} className={classes.icon} src={logo} />
    </a>
  );
};
