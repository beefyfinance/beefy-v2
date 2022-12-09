import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'fuse-fusefi',
    name: 'FuseFi',
    type: 'uniswapv2',
    routerAddress: '0xFB76e9E7d88E308aB530330eD90e84a952570319',
    factoryAddress: '0x1d1f1A7280D67246665Bb196F38553b469294f3a',
    pairInitHash: '0x04990f130515035f22e76663517440918b83941b25a4ec04ecdf4b2898e846aa',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fuse-sushi',
    name: 'Sushi',
    type: 'uniswapv2',
    routerAddress: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
    factoryAddress: '0x43eA90e2b786728520e4f930d2A71a477BF2737C',
    pairInitHash: '0x1901958ef8b470f2c0a3875a79ee0bd303866d85102c0f1ea820d317024d50b5',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'fuse-voltage',
    name: 'Voltage',
    type: 'uniswapv2',
    routerAddress: '0xE3F85aAd0c8DD7337427B9dF5d0fB741d65EEEB5',
    factoryAddress: '0x1998E4b0F1F922367d8Ec20600ea2b86df55f34E',
    pairInitHash: '0xe5f5532292e2e2a7aee3c2bb13e6d26dca6e8cc0a843ddd6f37c436c23cfab22',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
];
