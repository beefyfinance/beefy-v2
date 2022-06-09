import React from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import InsertIcon from '@material-ui/icons/InsertLink';
import { LinkButtonProps } from './LinkButtonProps';

const useStyles = makeStyles(styles);

export const LinkButton: React.FC<LinkButtonProps> = ({ href, text, type }) => {
  const classes = useStyles();
  return (
    <a className={classes.link} href={href} target="_blank" rel="noopener noreferrer">
      {type === 'code' && <CodeRoundedIcon fontSize="inherit" className={classes.icon} />}
      {type === 'link' && <InsertIcon fontSize="inherit" className={classes.icon} />}
      <span>{text}</span>
      <OpenInNewRoundedIcon fontSize="inherit" className={classes.icon} />
    </a>
  );
};
