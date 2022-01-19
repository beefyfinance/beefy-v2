import ERC20ABI from '../config/abi/erc20.json';

export function getERC20Contract(tokenAddress, web3) {
  return web3
    ? new web3.eth.Contract(ERC20ABI, tokenAddress, {
        from: web3.eth.defaultAccount,
      })
    : null;
}
