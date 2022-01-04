import React from 'react';
import find from 'lodash/find';
import moment from 'moment';
import { getVaults } from '../../../helpers/api';

export const useLastHarvest = (vaultId: string) => {
  const [state, setState] = React.useState('');

  React.useEffect(() => {
    async function fetchData() {
      const data = await getVaults();
      // const vault = data.filter(vault => vault.id.includes(vaultId));
      const vault = find(data, function (i) {
        return i.id === vaultId;
      });

      if (vault && 'lastHarvest' in vault && vault.lastHarvest === 0) {
        setState('never');
      }

      if (vault && 'lastHarvest' in vault) {
        const string = moment.unix(parseInt(vault.lastHarvest)).fromNow();
        const lastHarvest = string
          .replace(' hours', 'h')
          .replace(' minutes', 'm')
          .replace(' days', 'd');

        if (parseInt(vault.lastHarvest) === 0) {
          setState('never');
        } else {
          setState(lastHarvest);
        }
      }
    }

    fetchData();
  }, [vaultId]);

  return state;
};
