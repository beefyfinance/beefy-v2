import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import styles from './styles';

const useStyles = makeStyles(styles);

const LinkButton = ({ href, text }) => {
  const classes = useStyles();
  return (
    <a className={classes.container} href={href} target="_blank" rel="noopener noreferrer">
      <Typography className={classes.text}>{text}</Typography>
      <svg width="5" height="10" viewBox="0 0 5 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 1.97485L4 5.00006L1 8.02527"
          stroke="#6B7199"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
};

export default LinkButton;
