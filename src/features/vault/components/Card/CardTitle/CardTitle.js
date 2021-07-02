import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

import styles from './styles';

const useStyles = makeStyles(styles);

const CardTitle = ({ title, subtitle }) => {
    const classes = useStyles();

    return (
        <div className={classes.container}>
            {typeof title === 'object' ? <>{title}</> : (
                <Typography className={classes.title}>{title}</Typography>
            )} 
            {subtitle && <Typography className={classes.subtitle}>{subtitle}</Typography>}
        </div>
    )
}

export default CardTitle;