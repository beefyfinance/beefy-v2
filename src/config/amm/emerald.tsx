import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'emerald-yuzuswap',
    name: 'YuzuSwap',
    type: 'uniswapv2',
    routerAddress: '0x250d48C5E78f1E85F7AB07FEC61E93ba703aE668',
    factoryAddress: '0x5F50fDC22697591c1D7BfBE8021163Fc73513653',
    pairInitHash: '0x0bb8a7327a411245127096fe3de27e8b77c9f202a1451409e78b04984d70601a',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '0',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
];
