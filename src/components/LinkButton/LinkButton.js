import React from 'react';
import { Typography, makeStyles } from '@material-ui/core';
import styles from './styles';

const useStyles = makeStyles(styles);

const LinkButton = ({ href, text }) => {
  const classes = useStyles();
  return (
    <a className={classes.container} href={href} target="_blank" rel="noopener noreferrer">
      <Typography className={classes.text}>{text}</Typography>
      <svg
        width="12"
        height="10"
        viewBox="0 0 12 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.09608 4.37427L6.182 1.35127C5.94411 1.10449 5.94493 0.713477 6.18384 0.467687C6.43322 0.211135 6.84517 0.211059 7.09464 0.467518L10.8226 4.29989C11.2 4.68792 11.2002 5.30586 10.8229 5.69408L7.09408 9.53114C6.84495 9.7875 6.43333 9.78752 6.18418 9.5312C5.94521 9.28535 5.9448 8.89413 6.18324 8.64778L9.10963 5.62427L0.625001 5.62427C0.279823 5.62427 0 5.34445 0 4.99927C0 4.65409 0.279822 4.37427 0.625 4.37427L9.09608 4.37427Z"
          fill="#8585A6"
        />
      </svg>
    </a>
  );
};

export default LinkButton;
