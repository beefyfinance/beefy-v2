import React from 'react';
import {makeStyles, Paper, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';

const useStyles = makeStyles(styles);

const TokenInfo = ({ token }) => {
    const classes = useStyles();

    const { symbol, website, tokenAddress, description} = token;

    return (
        <Paper className={classes.cardContainer}>
            <div className={classes.cardHeader}>
                <div>
                    <div>
                        <Typography className={classes.cardTitle}>{symbol}</Typography>
                    </div>
                    <div>
                        <Typography className={classes.cardSubtitle}>Asset details</Typography>
                    </div>
                </div>
                <div className={classes.cardActions}>
                    <div className={classes.cardAction}>
                        <LinkButton href={website} text="Website" />
                    </div>
                    <div className={classes.cardAction}>
                        <LinkButton href={tokenAddress}  className={classes.cardAction} text="Token Contract" />
                    </div>
                </div>
            </div>
            <div className={classes.cardContent}>
                <Typography>{description}</Typography>
            </div>
        </Paper>
    );
};

export default TokenInfo;
