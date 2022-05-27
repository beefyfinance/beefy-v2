import React from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { SimpleLinkButtonProps } from './SimpleLinkButtonProps';

const useStyles = makeStyles(styles);

export const SimpleLinkButton: React.FC<SimpleLinkButtonProps> = ({ href, text }) => {
  const classes = useStyles();
  return (
    <a className={classes.link} href={href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};
