import React from 'react';
import moment from 'moment';
import { makeStyles, Paper } from '@material-ui/core';

import styles from './styles';
import { formatTvl, formatApy } from '../../../../../helpers/format';

const useStyles = makeStyles(styles);

const LABELS = ['TVL', 'Token Price', 'APY'];

const CustomTooltip = ({ active, payload, stat}) => {
    const classes = useStyles();
    
    if (active && payload && payload.length) {
        const formattedDate = moment(new Date(payload[0].payload.ts)).format('lll');
        const formattedValue = stat === 2 ? formatApy(payload[0].value) : formatTvl(payload[0].value);

        return (
        <Paper className={classes.container}>
            <p>{formattedDate}</p>
            <p className="label">{`${LABELS[stat]} : ${formattedValue}`}</p>
        </Paper>
        );
    }
  
    return null;
  };

export default CustomTooltip;
