import { useState, useEffect } from 'react';
import axios from 'axios';

const useChartData = () => {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        // Pegarle al endpoint de data para TVL.
        const url = `https://beefy-db.herokuapp.com/tvl?name=bifi-maxi-56&period=hour&from=1627570936&limit=24`

        const fetchData = async () => {
            const request = await axios.get(url);


            setChartData(request.data);
        }
        // Limpiar data si es necesario.

        fetchData();
        // Update chart data
    }, []);

    return chartData;
}

export default useChartData;