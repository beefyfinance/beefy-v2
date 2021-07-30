import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { 
    makeStyles, 
    Box,
} from '@material-ui/core';
import {
    AreaChart, 
    Area,
    YAxis, 
    Tooltip, 
    CartesianGrid,
    ResponsiveContainer,
    Text,
} from "recharts";

import styles from './styles';
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardContent from "../Card/CardContent";
import CardTitle from "../Card/CardTitle/CardTitle";
import CustomTooltip from "./CustomTooltip";
import Tabs from "../../../../components/Tabs";
import useChartData from "./useChartData";
import { formatTvl } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

const Graph = () => {
    const classes = useStyles();
    const [metric, setMetric] = useState(0);
    const [timeframe, setTimeframe] = useState(0);
    const chartData = useChartData();

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Historical rate" />
                <div className={classes.headerTabs}>
                    <div className={classes.headerTab}>
                        <Tabs
                            labels={['TVL', 'Price', 'Daily']} 
                            value={metric}
                            onChange={newValue => setMetric(newValue)} 
                        />
                    </div>
                    <div className={classes.headerTab}>
                        <Tabs 
                            labels={['1D', '1W', '1M', '1Y']}
                            value={timeframe}
                            onChange={newValue => setTimeframe(newValue)} 
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Box style={{height: 250}}>
                    <ResponsiveContainer>
                        <AreaChart data={chartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                            <CartesianGrid 
                                vertical={false}
                                stroke="#484D73"
                            />
                            <YAxis 
                                dataKey="v" 
                                tick={{
                                    fill: "white",
                                    fontSize: 11
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(label) => formatTvl(label)}
                                tickCount={4}
                                width={50}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                            />
                            <Area 
                                dataKey="v"
                                fill="red"
                                stroke="#6E6399"
                                strokeWidth={4}
                                fill="rgba(98, 84, 153, 0.13)"
                                fillOpacity={100}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default Graph;
