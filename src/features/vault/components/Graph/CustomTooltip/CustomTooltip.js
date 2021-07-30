import React from 'react';
import moment from 'moment';
import { makeStyles, Paper } from '@material-ui/core';

import styles from './styles';
import { formatTvl } from '../../../../../helpers/format';

const useStyles = makeStyles(styles);

const CustomTooltip = ({ active, payload, label }) => {
    const classes = useStyles();

    if (active && payload && payload.length) {
        const formattedDate = moment(new Date(payload[0].payload.ts)).format('lll');

        return (
        <Paper className={classes.container}>
            <p>{formattedDate}</p>
            <p className="label">{`TVL : ${formatTvl(payload[0].value)}`}</p>
        </Paper>
        );
    }
  
    return null;
  };

export default CustomTooltip;
