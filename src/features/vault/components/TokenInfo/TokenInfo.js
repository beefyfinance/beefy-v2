import React from 'react';
import {makeStyles, Paper, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';

const useStyles = makeStyles(styles);

const VaultItem = ({ token }) => {
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
                    <LinkButton href={website} text="Website" />
                    <LinkButton href={tokenAddress} text="Token Contract" />
                </div>
            </div>
            <div className={classes.cardContent}>
                <Typography>{description}</Typography>
            </div>
        </Paper>
    );
};

export default VaultItem;
