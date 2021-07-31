import { useState, useEffect } from 'react';
import axios from 'axios';

import { config } from '../../../../config/config';

const STATS = {
    0: 'tvl',
    1: 'price',
    2: 'apy'
}

const useChartData = (stat, oracleId, vaultId, network) => {
    const [chartData, setChartData] = useState(null);

    let name;
    if (stat === 0) {
        name = `${vaultId}-${config[network].chainId}`
    } else if (stat === 1) {
        name = oracleId;
    } else {
        name = vaultId
    }
    
    useEffect(() => {
        const url = `https://beefy-db.herokuapp.com/${STATS[stat]}?name=${name}&period=hour&from=1627570936&limit=24`

        const fetchData = async () => {
            const request = await axios.get(url);

            console.log(request.data);

            setChartData(request.data);
        }

        fetchData();
    }, [stat]);

    return chartData;
}

export default useChartData;