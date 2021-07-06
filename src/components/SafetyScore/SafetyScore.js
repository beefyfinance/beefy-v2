import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import styles from './styles';

const styleProps = (score, whiteLabel, size) => {
    let props = { labelColor: "#4A9252", smColor: "#4A9252", mdColor: "#4A9252", lgColor: "#4A9252", size }
    
    if (score === 0) {
        props = { labelColor: "#424866", smColor: "#424866", mdColor: "#424866", lgColor: "#424866" }
    } else if (score <= 4) {
        props = { labelColor: "#E84525", smColor: "#E84525", mdColor: "#424866", lgColor: "#424866" }
    } else if (score <= 7.5) {
        props = { labelColor: "#E88225", smColor: "#E88225", mdColor: "#E88225", lgColor: "#424866" }
    } 

    if (whiteLabel) props.labelColor = '#white';

    return props;
}

const useStyles = makeStyles(styles);

const SafetyScore = ({ score, whiteLabel, size = 'lg' }) => {
    const classes = useStyles(styleProps(score, whiteLabel, size));

    return (
        <div className={classes.container}>
            {score === 0 ? (
                <Typography className={classes.label}>-</Typography>
            ) : (
                <Typography className={classes.label}>{score}</Typography>
            )}
            
            <div className={classes.barsContainer}>
                <div className={classes.sm}></div>
                <div className={classes.md}></div>
                <div className={classes.lg}></div>
            </div>
        </div>
    );
};

export default SafetyScore;
