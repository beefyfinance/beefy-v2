import React from 'react';
import {makeStyles, Paper, Typography} from '@material-ui/core';
import styles from './styles';
import LinkButton from '../../../../components/LinkButton/LinkButton';
import question from "./question.svg";
import up from "./up.svg";
import down from "./down.svg";
import risks from "../../../../config/risk.json"

const useStyles = makeStyles(styles);

const RiskInfo = ({ vaultRisks }) => {
    const classes = useStyles();

    return (
        <Paper className={classes.cardContainer}>
            <div className={classes.cardHeader}>
                <div>
                    <div>
                        <Typography className={classes.cardTitle}>3.1</Typography>
                    </div>
                    <div>
                        <Typography className={classes.cardSubtitle}>Beefy risk profile</Typography>
                    </div>
                </div>
                <div className={classes.cardActions}>
                    <LinkButton href="#" text="How is it calculated?" />
                </div>
            </div>
            <div className={classes.cardContent}>
                <div className={classes.riskList}>
                    {vaultRisks.map(risk => (
                        <div className={classes.riskRow}>
                            <div className={classes.infoContainer}>
                                {risks[risk].value > 0 ? (
                                    <img src={up} className={classes.arrow} />
                                ) : (
                                    <img src={down} className={classes.arrow} />
                                )}
                                <div>
                                    <Typography className={classes.risk}>{risks[risk].name}</Typography>
                                    <Typography className={classes.riskCategory}>{risks[risk].category}</Typography>
                                </div>
                            </div>
                            <div className={classes.moreInfoContainer}>
                                <Typography className={classes.moreInfoLabel}>What does this mean</Typography>
                                <img src={question} className={classes.moreInfoIcon}/>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={classes.notes}>
                    <Typography>The lower the Beefy Risk Score the safer your investment.</Typography>
                    <Typography>
                        Your funds are secure on beefy.finance. The development team put a lot of time and effort into checking the code 
                        of the vaults they add to the platform. They also have a panic button to pause and protect your assets at short 
                        notice if there is any suspicious activity.
                    </Typography>
                </div>
            </div>
        </Paper>
    );
};



export default RiskInfo;
