import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'aurora-trisolaris',
    name: 'Trisolaris',
    type: 'uniswapv2',
    routerAddress: '0x2CB45Edb4517d5947aFdE3BEAbF95A582506858B',
    factoryAddress: '0xc66F594268041dB60507F00703b152492fb176E7',
    pairInitHash: '0x754e1d90e536e4c1df81b7f030f47b4ca80c87120e145c294f098c83a6cb5ace',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut',
  },
];
