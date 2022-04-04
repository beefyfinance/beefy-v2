import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { SimpleLinkButtonProps } from './SimpleLinkButtonProps';

const useStyles = makeStyles(styles as any);
export const SimpleLinkButton: React.FC<SimpleLinkButtonProps> = ({ href, text }) => {
  const classes = useStyles();
  return (
    <a className={classes.container} href={href} target="_blank" rel="noopener noreferrer">
      <Typography variant="body1" className={classes.text}>
        {text}
      </Typography>
    </a>
  );
};
