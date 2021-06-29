import React from 'react';
import {config} from "../../../../config/config";
import {formatApy} from "../../../../helpers/format"
import {makeStyles, Paper, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';
import shield from "./shield.svg"
import stratText from "./stratText"

const useStyles = makeStyles(styles);

const StrategyInfo = ({ stratType, stratAddr, vaultAddr, apy, audit, network, platform, assets, want }) => {
    const classes = useStyles();

    return (
        <Paper className={classes.cardContainer}>
            <div className={classes.cardHeader}>
                <div>
                    <Typography className={classes.cardTitle}>Strategy</Typography>
                </div>
                <div className={classes.cardActions}>
                    <div className={classes.cardAction}>
                        <LinkButton href={`${config[network].explorerUrl}/address/${stratAddr}`} text="Strategy address" />
                    </div>
                    <div className={classes.cardAction}>
                        <LinkButton href={`${config[network].explorerUrl}/address/${vaultAddr}`} text="Vault address" />
                    </div>                           
                </div>
            </div>
            <div className={classes.cardContent}>
                <Typography className={classes.text}>{stratText(stratType, platform, assets, want)}</Typography>
                <div className={classes.apysContainer}>
                    <Typography className={classes.apyTitle}>APY breakdown</Typography>
                    <div className={classes.apys}>
                         <div className={classes.apy}>
                            <Typography className={classes.apyValue}>{formatApy(apy.totalApy, '-')}</Typography>
                            <Typography className={classes.apyLabel}>Total APY</Typography>
                        </div>
                        {apy.vaultApr && (
                            <div className={classes.apy}>
                                <Typography className={classes.apyValue}>{formatApy(apy.vaultApr, '-')}</Typography>
                                <Typography className={classes.apyLabel}>Farm APR</Typography>
                            </div>
                        )}
                        {apy.tradingApr && (
                            <div className={classes.apy}>
                                <Typography className={classes.apyValue}>{formatApy(apy.tradingApr, '-')}</Typography>
                                <Typography className={classes.apyLabel}>Trading APR</Typography>
                            </div>
                        )}
                        {apy.boostApr && (
                            <div className={classes.apy}>
                                <Typography className={classes.apyValue}>{formatApy(apy.boostApr, '-')}</Typography>
                                <Typography className={classes.apyLabel}>Boost APR</Typography>
                            </div>
                        )}

                    </div>
                </div>
                <div className={classes.audits}>
                    {audit ? (
                        <a href="#" target="_blank" rel="noopener noreferrer" className={classes.audit}>
                            <img src={shield} className={classes.auditIcon} />
                            <Typography className={classes.auditLabel} >Audited</Typography>
                        </a>
                    ) : null}

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
