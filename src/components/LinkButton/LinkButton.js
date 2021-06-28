import React from 'react';
import {Box, Typography, makeStyles} from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import styles from './styles';

const useStyles = makeStyles(styles);

const LinkButton = ({href, text}) => {
    const classes = useStyles();
    return (
        <a className={classes.container} href={href}>
            <Typography className={classes.text}>{text}</Typography>
            <svg
                width="5"
                height="10"
                viewBox="0 0 5 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 1.97485L4 5.00006L1 8.02527"
                    stroke="#6B7199"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </a>
    );
};

export default LinkButton;
