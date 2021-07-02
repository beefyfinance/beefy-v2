import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import styles from './styles';

const styleProps = score => {
    if (score <= 4) {
        return { labelColor: "#E84525", smColor: "#E84525", mdColor: "#424866", lgColor: "#424866" }
    } else if (score <= 7.5) {
        return { labelColor: "#E88225", smColor: "#E88225", mdColor: "#E88225", lgColor: "#424866" }
    } else {
        return { labelColor: "#4A9252", smColor: "#4A9252", mdColor: "#4A9252", lgColor: "#4A9252" }
    }   
}

const useStyles = makeStyles(styles);

const SafetyScore = ({ score }) => {
    const classes = useStyles(styleProps(score));

    return (
        <div className={classes.container}>
            <Typography className={classes.label}>{score}</Typography>
            <div className={classes.barsContainer}>
                <div className={classes.sm}></div>
                <div className={classes.md}></div>
                <div className={classes.lg}></div>
            </div>
        </div>
    );
};

export default SafetyScore;
