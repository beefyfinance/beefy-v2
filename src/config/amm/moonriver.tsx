import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'moonriver-solarbeam',
    name: 'Solarbeam',
    type: 'uniswapv2',
    routerAddress: '0xAA30eF758139ae4a7f798112902Bf6d65612045f',
    factoryAddress: '0x049581aEB6Fe262727f290165C29BDAB065a1B68',
    pairInitHash: '0x9a100ded5f254443fbd264cb7e87831e398a8b642e061670a9bc35ba27293dbf',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '5',
    swapFeeNumerator: '25',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOutWithFee', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut, uint fee)
  },
  {
    id: 'moonriver-sushi',
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
];
