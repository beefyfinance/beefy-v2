import React from 'react';
import { makeStyles, Paper, Box } from '@material-ui/core';
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";

import styles from './styles';
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardContent from "../Card/CardContent";
import CardTitle from "../Card/CardTitle/CardTitle"

const useStyles = makeStyles(styles);

const chartData = [
    { name: "28 Jan", apy: 45.00 },
    { name: "4 Feb", apy: 57.15 },
    { name: "11 Feb", apy: 38.50 },
    { name: "18 Feb", apy: 41.37 }
];

const TokenCard = () => {
    const classes = useStyles();

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Historical rate" />
                
            </CardHeader>
            <CardContent>
                <Paper className={classes.paper}>
                    <Box style={{height: 250}}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{top: 10, right: 30, left: 0, bottom: 5}}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="apy" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            </CardContent>
        </Card>
    );
};

export default TokenCard;
