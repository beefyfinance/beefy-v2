import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'moonriver-solarbeam',
    name: 'Solarbeam',
    type: 'uniswapv2',
    routerAddress: '0xAA30eF758139ae4a7f798112902Bf6d65612045f',
    factoryAddress: '0x049581aEB6Fe262727f290165C29BDAB065a1B68',
    pairInitHash: '0x9a100ded5f254443fbd264cb7e87831e398a8b642e061670a9bc35ba27293dbf',
    swapFee: 0.0025,
    getAmountOutMode: 'getAmountOutWithFee',
    getAmountOutFee: '25',
  },
  {
    id: 'moonriver-sushi',
    name: 'Sushi',
    type: 'uniswapv2',
    routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
    factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    pairInitHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
    swapFee: 0.003,
    getAmountOutMode: 'getAmountOut',
  },
];
