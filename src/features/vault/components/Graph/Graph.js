import React, { useState } from 'react';
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
} from "recharts";

import styles from './styles';
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardContent from "../Card/CardContent";
import CardTitle from "../Card/CardTitle/CardTitle";
import CustomTooltip from "./CustomTooltip";
import Tabs from "../../../../components/Tabs";
import useChartData from "./useChartData";
import { formatTvl, formatApy } from '../../../../helpers/format';

const useStyles = makeStyles(styles);

const Graph = ({ oracleId, vaultId, network }) => {
    const classes = useStyles();
    const [stat, setStat] = useState(2);
    const [period, setPeriod] = useState(2);
    const chartData = useChartData(stat, period, oracleId, vaultId, network);

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Historical rate" />
                <div className={classes.headerTabs}>
                    <div className={classes.headerTab}>
                        <Tabs
                            labels={['TVL', 'Price', 'APY']} 
                            value={stat}
                            onChange={newValue => setStat(newValue)} 
                        />
                    </div>
                    <div className={classes.headerTab}>
                        <Tabs 
                            labels={['1D', '1W', '1M', '1Y']}
                            value={period}
                            onChange={newValue => setPeriod(newValue)} 
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
                                tickFormatter={(label) => stat === 2 ? formatApy(label) : formatTvl(label)}
                                tickCount={4}
                                width={50}
                            />
                            <Tooltip
                                content={<CustomTooltip stat={stat} />}
                            />
                            <Area 
                                dataKey="v"
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
