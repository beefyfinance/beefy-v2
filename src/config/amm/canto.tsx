import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'canto-canto',
    name: 'Canto Dex',
    type: 'solidly',
    routerAddress: '0xa252eEE9BDe830Ca4793F054B506587027825a8e',
    factoryAddress: '0xE387067f12561e579C5f7d4294f51867E0c1cFba',
    pairInitHash: '0x97653931c50be3c0550346c96798d2d21ba0ebddcbc1a6debaa0669b70bb5735',
    minimumLiquidity: '1000',
    swapFeeNumerator: '0', // DYNAMIC factory.getFee(stable);
    swapFeeDenominator: '1',
    getAmountOutMode: 'getAmountOut', // router.getAmountsOut(uint amountIn, route[] memory routes) public view returns (uint[] memory amounts) or pair.getAmountOut(uint256 amountIn, address tokenIn) view returns (uint256)
  },
];
