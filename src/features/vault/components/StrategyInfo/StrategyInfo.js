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
                    <LinkButton href={stratAddr} text="Strategy address" />
                    <LinkButton href={vaultAddr} text="Vault address" />
                </div>
            </div>
            <div className={classes.cardContent}>
                <div>
                    <Typography>{description}</Typography>
                </div>
                <div className={classes.apyContainer}>
                    <Typography className={classes.apyTitle}>APY breakdown</Typography>
                    <div className={classes.apys}>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>128%</Typography>
                            <Typography className={classes.apyLabel}>Yield Farming</Typography>
                        </div>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>128%</Typography>
                            <Typography className={classes.apyLabel}>Yield Farming</Typography>
                        </div>
                        <div className={classes.apy}>
                            <Typography className={classes.apyValue}>128%</Typography>
                            <Typography className={classes.apyLabel}>Yield Farming</Typography>
                        </div>
                    </div>
                </div>
                <div className={classes.audits}>
                    <div className={classes.audit}>
                        <img src={shield} className={classes.auditIcon} />
                        <Typography className={classes.auditLabel} >Audited</Typography>
                    </div>
                    <div className={classes.audit}>
                        <img src={shield} className={classes.auditIcon} />
                        <Typography className={classes.auditLabel} >Community Audited</Typography>
                    </div>
                </div>
            </div>
        </Paper>
    );
};

export default StrategyInfo;
