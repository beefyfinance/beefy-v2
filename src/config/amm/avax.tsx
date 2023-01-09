import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'avax-pangolin',
    name: 'Pangolin',
    type: 'uniswapv2',
    routerAddress: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
    factoryAddress: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88',
    pairInitHash: '0x40231f6b438bce0797c9ada29b718a87ea0a5cea3fe9a771abdd76bd41a3e545',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'avax-olive',
    name: 'Olive',
    type: 'uniswapv2',
    routerAddress: '0x0c45FB63001b56a21e29c7dcc1727bfDA273a368',
    factoryAddress: '0x4Fe4D8b01A56706Bc6CaD26E8C59D0C7169976b3',
    pairInitHash: '0xb7145948956af92afd2ae97eff039ada60998237282c1687ca23ce1ad5e1d282',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '2',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut)
  },
  {
    id: 'avax-joe',
    name: 'Joe',
    type: 'uniswapv2',
    routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
    factoryAddress: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
    pairInitHash: '0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut)
  },
  {
    id: 'avax-swapsicle',
    name: 'Swapsicle',
    type: 'uniswapv2',
    routerAddress: '0xC7f372c62238f6a5b79136A9e5D16A2FD7A3f0F5',
    factoryAddress: '0x9C60C867cE07a3c403E2598388673C10259EC768',
    pairInitHash: '0x9e43ee37212e3296c7f6087d3e0a37b48a4e4e413538dac0fd18cfe2f80666c1',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5.666666666666666666666666666666', // (17/3) + separate DYNAMIC feeOnStake mint fee
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut)
  },
];
