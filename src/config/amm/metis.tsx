import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'metis-netswap',
    name: 'Netswap',
    type: 'uniswapv2',
    routerAddress: '0x1E876cCe41B7b844FDe09E38Fa1cf00f213bFf56',
    factoryAddress: '0x70f51d68D16e8f9e418441280342BD43AC9Dff9f',
    pairInitHash: '0x966d65068a6a30f10fd1fa814258637a34e059081d79daa94f3e2b6cec48e810',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3', // DYNAMIC factory.feeRate()
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external view returns (uint amountOut)
  },
  {
    id: 'metis-tethys',
    name: 'Tethys',
    type: 'uniswapv2',
    routerAddress: '0x81b9FA50D5f5155Ee17817C21702C3AE4780AD09',
    factoryAddress: '0x2CdFB20205701FF01689461610C9F321D1d00F80',
    pairInitHash: '0xef3f1aabf6b944a53c06890783ddef260a21995d1eaea6d52f980cfe082a877d',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '2',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut)
  },
  {
    id: 'metis-hermes',
    name: 'hermes',
    type: 'solidly',
    routerAddress: '0x2d4F788fDb262a25161Aa6D6e8e1f18458da8441',
    factoryAddress: '0x633a093C9e94f64500FC8fCBB48e90dd52F6668F',
    pairInitHash: '0x1206c53c96c9926d750268b77c1897f0b6035ff853c3ba6088623ed7df249367',
    minimumLiquidity: '1000',
    swapFeeNumerator: '1',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
];
