import React from 'react';
import lodash from 'lodash';
import moment from 'moment';
import { getVaults } from '../../../helpers/api';

export const useLastHarvest = (vaultId: string) => {
  const [state, setState] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      const data = await getVaults();
      // const vault = data.filter(vault => vault.id.includes(vaultId));
      const vault = lodash.find(data, function (i) {
        return i.id === vaultId;
      });

      var ts = Math.round(new Date().getTime() / 1000);

      const string =
        vault && vault.lastHarvest === 0
          ? moment.unix(ts).startOf('hour').fromNow()
          : moment.unix(parseInt(vault.lastHarvest)).fromNow();

      string.replace(' hours', 'h');
      string.replace(' minutes', 'm');

      setState(string.replace(' hours', 'h').replace(' minutes', 'm').replace(' days', 'd'));
    }

    fetchData();
  }, [vaultId]);

  return state;
};
