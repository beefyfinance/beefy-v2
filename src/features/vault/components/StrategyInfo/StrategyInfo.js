import React from 'react';
import {makeStyles, Paper, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';
import shield from "./shield.svg"

const useStyles = makeStyles(styles);

const StrategyInfo = ({ description, stratAddr, vaultAddr, apy, audit, communityAudit }) => {
    const classes = useStyles();

    return (
        <Paper className={classes.cardContainer}>
            <div className={classes.cardHeader}>
                <div>
                    <Typography className={classes.cardTitle}>Strategy</Typography>
                </div>
                <div className={classes.cardActions}>
                    <div className={classes.cardAction}>
                        <LinkButton href={stratAddr} text="Strategy address" />
                    </div>
                    <div className={classes.cardAction}>
                        <LinkButton href={vaultAddr} text="Vault address" />
                    </div>                           
                </div>
            </div>
            <div className={classes.cardContent}>
                <Typography className={classes.text}>{description}</Typography>
                <div className={classes.apysContainer}>
                    <Typography className={classes.apyTitle}>APY breakdown</Typography>
                    <div className={classes.apys}>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>128%</Typography>
                            <Typography className={classes.apyLabel}>Yield Farming</Typography>
                        </div>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>50%</Typography>
                            <Typography className={classes.apyLabel}>Trading Fees</Typography>
                        </div>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>201%</Typography>
                            <Typography className={classes.apyLabel}>Boost Rewards</Typography>
                        </div>
                    </div>
                </div>
                <div className={classes.audits}>
                    <a href="#" target="_blank" rel="noopener noreferrer" className={classes.audit}>
                        <img src={shield} className={classes.auditIcon} />
                        <Typography className={classes.auditLabel} >Audited</Typography>
                    </a>
                    <a href="#" target="_blank" rel="noopener noreferrer"  className={classes.audit}>
                        <img src={shield} className={classes.auditIcon} />
                        <Typography className={classes.auditLabel} >Community Audited</Typography>
                    </a>
                </div>
            </div>
        </Paper>
    );
};

export default StrategyInfo;
