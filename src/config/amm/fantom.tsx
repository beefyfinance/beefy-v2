import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'fantom-spookyswap',
    name: 'SpookySwap',
    type: 'uniswapv2',
    routerAddress: '0xF491e7B69E4244ad4002BC14e878a34207E38c29',
    factoryAddress: '0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3',
    pairInitHash: '0xcdf2deca40a0bd56de8e3ce5c7df6727e5b1bf2ac96f283fa9c4b3e6b42ea9d2',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '2',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-jetswap',
    name: 'JetSwap',
    type: 'uniswapv2',
    routerAddress: '0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25',
    factoryAddress: '0xf6488205957f0b4497053d6422F49e27944eE3Dd',
    pairInitHash: '0xa5e6089ea250dac750e4867fc4ce7f2a864bd94446564351fe9329f378963974',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '1',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-spiritswap',
    name: 'SpiritSwap',
    type: 'uniswapv2',
    routerAddress: '0x16327E3FbDaCA3bcF7E38F5Af2599D2DDc33aE52',
    factoryAddress: '0xEF45d134b73241eDa7703fa787148D9C9F4950b0',
    pairInitHash: '0xe242e798f6cee26a9cb0bbf24653bf066e5356ffeac160907fe2cc108e238617',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-sushi',
    name: 'Sushi',
    type: 'uniswapv2',
    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    pairInitHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-wigoswap',
    name: 'WigoSwap',
    type: 'uniswapv2',
    routerAddress: '0x5023882f4D1EC10544FCB2066abE9C1645E95AA0',
    factoryAddress: '0xC831A5cBfb4aC2Da5ed5B194385DFD9bF5bFcBa7',
    pairInitHash: '0x55c39e9406ff3c89a193882b4752879e73c8a0ce1222fe1de34c5e8f6482d9b6',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '18',
    swapFeeNumerator: '9981',
    swapFeeDenominator: '10000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-tombswap',
    name: 'TombSwap',
    type: 'uniswapv2',
    routerAddress: '0x6D0176C5ea1e44b08D3dd001b0784cE42F47a3A7',
    factoryAddress: '0xE236f6890F1824fa0a7ffc39b1597A5A6077Cfe9',
    pairInitHash: '0x2dfbcf1b907f911bc66d083d103a1d7de0b8b21a6cb2a66a78d1f1559018fba4',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '1', // DYNAMIC factory.mintFee()
    swapFeeNumerator: '5', // DYNAMIC factory.swapFee()
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fantom-solidly',
    name: 'Solidly',
    type: 'solidly',
    routerAddress: '0xa38cd27185a464914D3046f0AB9d43356B34829D',
    factoryAddress: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
    pairInitHash: '0x57ae84018c47ebdaf7ddb2d1216c8c36389d12481309af65428eb6d460f747a4',
    minimumLiquidity: '1000',
    swapFeeNumerator: '1',
    swapFeeDenominator: '10000',
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
  {
    id: 'fantom-spirit-v2',
    name: 'SpiritSwap',
    type: 'solidly',
    routerAddress: '0x09855B4ef0b9df961ED097EF50172be3e6F13665',
    factoryAddress: '0x9d3591719038752db0c8bEEe2040FfcC3B2c6B9c',
    pairInitHash: '0x5442fb448d86f32a7d2a9dc1a457e64bf5a6c77415d98802aac4fb5a9dc5ecd9',
    minimumLiquidity: '1000',
    swapFeeNumerator: '1',
    swapFeeDenominator: '556', // DYNAMIC pair.fee() [currently 2500 for stable and 556 for volatile)
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
  {
    id: 'fantom-equalizer',
    name: 'Equalizer',
    type: 'solidly',
    routerAddress: '0x1A05EB736873485655F29a37DEf8a0AA87F5a447',
    factoryAddress: '0xc6366EFD0AF1d09171fe0EBF32c7943BB310832a',
    pairInitHash: '0x02ada2a0163cd4f7e0f0c9805f5230716a95b174140e4c84c14883de216cc6a3',
    minimumLiquidity: '1000',
    swapFeeNumerator: '2', // DYNAMIC factory.getFee(stable);
    swapFeeDenominator: '10000',
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
];
