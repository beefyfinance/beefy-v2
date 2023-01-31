import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'ethereum-sushi',
    name: 'Sushi',
    type: 'uniswapv2',
    routerAddress: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
    factoryAddress: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    pairInitHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'ethereum-solidly',
    name: 'Solidly',
    type: 'solidly',
    routerAddress: '0x77784f96C936042A3ADB1dD29C91a55EB2A4219f',
    factoryAddress: '0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6',
    pairInitHash: '0x413d36e4ab9e83cf39b8064a3b5c98253a9e46a6cf02c8efd185314c866d656b',
    minimumLiquidity: '1000',
    swapFeeNumerator: '2000', // DYNAMIC pair.feeRatio();
    swapFeeDenominator: '1000000',
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
];
