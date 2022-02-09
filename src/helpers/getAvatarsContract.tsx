import AvatarsAbi from '../config/abi/BeefyAvatarsAbi.json';

export function getAvatarsContract(tokenAddress, web3) {
  return web3
    ? new web3.eth.Contract(AvatarsAbi, tokenAddress, {
        from: web3.eth.defaultAccount,
      })
    : null;
}
