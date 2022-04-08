export function getContract(tokenAddress, web3, abi) {
  return web3
    ? new web3.eth.Contract(abi, tokenAddress, {
        from: web3.eth.defaultAccount,
      })
    : null;
}
