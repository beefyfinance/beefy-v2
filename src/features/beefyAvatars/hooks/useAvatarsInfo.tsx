import { useState, useEffect } from 'react';
import { getAvatarsContract } from '../../../helpers/getAvatarsContract';
import { avatarsAddress } from '../constants';
import { getWalletConnectApiInstance } from '../../../features/data/apis/instances';

export function useAvatarsInfo() {
  const [cows, setCows] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    async function getCows() {
      const walletApi = await getWalletConnectApiInstance();
      const web3 = await walletApi.getConnectedWeb3Instance();
      const contract = getAvatarsContract(avatarsAddress, web3);
      const totalSupply = await contract?.methods.totalSupply().call();
      const cows = [];
      if (totalSupply) {
        for (let index = 1; index <= totalSupply; index++) {
          const metaData = await contract?.methods.metadata(index).call();
          cows.push(JSON.parse(metaData));
        }
      }
      return cows;
    }

    async function run() {
      const cows = await getCows();
      if (!isCancelled) {
        console.log(cows);
        setCows(cows);
      }
    }

    run();

    return () => {
      isCancelled = true;
    };
  }, []);

  return [cows];
}

/*
 



*/
