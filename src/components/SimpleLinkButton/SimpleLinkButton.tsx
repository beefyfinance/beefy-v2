import type { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { SimpleLinkButtonProps } from './SimpleLinkButtonProps';

const useStyles = makeStyles(styles);

export const SimpleLinkButton: FC<SimpleLinkButtonProps> = ({ href, text, IconComponent }) => {
  const classes = useStyles();
  return (
    <a className={classes.link} href={href} target="_blank" rel="noopener noreferrer">
      {IconComponent ? <IconComponent className={classes.icon} /> : null}
      {text}
    </a>
  );
};
