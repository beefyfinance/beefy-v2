import { useState, useEffect } from 'react';
import { getAvatarsContract } from '../../../helpers/getAvatarsContract';
import { avatarsAddress } from '../constants';
import { useSelector } from 'react-redux';

export function useAvatarsInfo() {
  const [cows, setCows] = useState([]);

  const { wallet } = useSelector((state: any) => ({
    wallet: state.walletReducer,
  }));

  const web3 = wallet.rpc['polygon'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const account = wallet.address;

  useEffect(() => {
    let isCancelled = false;

    async function getCows() {
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
  }, [web3]);

  return [cows];
}

/*
 



*/
