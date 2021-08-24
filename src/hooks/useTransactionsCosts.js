import React from 'react';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { addressBook } from 'blockchain-addressbook';
import { useSelector } from 'react-redux';

const useGasPrice = async (net, contractAddress) => {
  const [price, setPrice] = React.useState(0);
  const [gasLimit, setGasLimit] = React.useState(0);
  const [gasPrice, setGasPrice] = React.useState(0);
  const walletReducer = useSelector(state => state.walletReducer);
  const pricesReducer = useSelector(state => state.pricesReducer);
  const provider = await walletReducer.web3modal.connect();
  const web3 = await new Web3(provider);

  // web3.eth
  //   .estimateGas({
  //     // from: walletReducer.address,
  //     to: walletReducer.address,
  //     data: '0x8df44bd70000000000000000000000000000000000000000000000000000000000000001',
  //   })
  //   .then((err, gas) => console.log(gas));

  web3.eth.getTransactionCount(contractAddress, 'latest', (err, current) => {
    web3.eth.getBlock(current, (err, res) => {
      setGasLimit(BigNumber(res.gasLimit).toFixed());
    });
  });

  web3.eth.getGasPrice().then(gas => setGasPrice(gas));

  const nativeTokenPrice = pricesReducer.prices[addressBook[net].tokens.WNATIVE.symbol];

  setPrice(BigNumber(gasLimit).times(gasPrice).div(1e18).times(nativeTokenPrice).toFixed(2));

  return price;
};

export default useGasPrice;
