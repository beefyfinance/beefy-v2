import { AmmConfig } from '../../features/data/apis/config-types';

export const amms: AmmConfig[] = [
  {
    id: 'bsc-pancakeswap-v2',
    name: 'PancakeSwap V2',
    type: 'uniswapv2',
    routerAddress: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
    factoryAddress: '0xca143ce32fe78f1f7019d7d551a6402fc5350c73',
    pairInitHash: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
    minimumLiquidity: '1000',
    mintFeeNumerator: '8', // totalSupply.mul(rootK.sub(rootKLast)).mul(8);
    mintFeeDenominator: '17', // rootK.mul(17).add(rootKLast.mul(8));
    swapFeeNumerator: '25',
    swapFeeDenominator: '10000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'bsc-apeswap',
    name: 'ApeSwap',
    type: 'uniswapv2',
    routerAddress: '0xC0788A3aD43d79aa53B09c2EaCc313A787d1d607',
    factoryAddress: '0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6',
    pairInitHash: '0xf4ccce374816856d11f00e4069e7cada164065686fbef53c6167a63ec2fd8c5b',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '2',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'bsc-ooe',
    name: 'OOE',
    type: 'uniswapv2',
    routerAddress: '0xBeB43fbb2f7AEA8AC904975816BB1b4cA9f4D9c5',
    factoryAddress: '0xd76d8C2A7CA0a1609Aea0b9b5017B3F7782891bf',
    pairInitHash: '0xe7da666f616ba3bdb18c6908b22d556a41659bdd652762c246b8d1fa4f7506b4',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '2',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'bsc-mdex',
    name: 'MDEX',
    type: 'uniswapv2',
    routerAddress: '0x7dae51bd3e3376b8c7c4900e9107f12be3af1ba8',
    factoryAddress: '0x3cd1c46068daea5ebb0d3f55f6915b10648062b8',
    pairInitHash: '0x0d994d996174b05cfc7bed897dc1b20b4c458fc8d64fe98bc78b3c64a6b4d093',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3', // DYNAMIC factory.getPairRate(lp) [when factory.getPairRate(lp) != 9]
    swapFeeNumerator: '30', // DYNAMIC factory.getPairFees(lp)
    swapFeeDenominator: '10000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut, address token0, address token1) --> factory.getAmountOut
  },
  {
    id: 'bsc-babyswap',
    name: 'BabySwap',
    type: 'uniswapv2',
    routerAddress: '0x325E343f1dE602396E256B67eFd1F61C3A6B38Bd',
    factoryAddress: '0x86407bEa2078ea5f5EB5A52B2caA963bC1F889Da',
    pairInitHash: '0x48c8bec5512d397a5d512fbb7d83d515e7b6d91e9838730bd1aa1b16575da7f5',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '3',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'bsc-biswap',
    name: 'BiSwap',
    type: 'uniswapv2',
    routerAddress: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
    factoryAddress: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE',
    pairInitHash: '0xfea293c909d87cd4153593f077b76bb7e94340200f4ee84211ae8e4f9bd7ffdf',
    minimumLiquidity: '1000',
    mintFeeNumerator: '1',
    mintFeeDenominator: '1', // DYNAMIC pair.devFee()
    swapFeeNumerator: '1', // DYNAMIC pair.swapFee()
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountsOut', // getAmountOut(uint amountIn, uint reserveIn, uint reserveOut, uint swapFee) with pair.swapFee(), or getAmountsOut(address factory, uint amountIn, address[] memory path)
  },
  {
    id: 'bsc-cone',
    name: 'cone',
    type: 'solidly',
    routerAddress: '0xbf1fc29668e5f5Eaa819948599c9Ac1B1E03E75F',
    factoryAddress: '0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016',
    pairInitHash: '0x2ce84ffd93a6f7c4c5a44224783ccdded4a321b6d3fc965308f25c466ce132dd',
    minimumLiquidity: '1000',
    swapFeeNumerator: '1',
    swapFeeDenominator: '2000', // DYNAMIC pair.swapFee() (default 2000 volatile, 10000 stable)
    getAmountOutMode: 'getAmountOut', // router.getExactAmountOut(uint amountIn, address tokenIn, address tokenOut, bool stable) -> pair.getAmountOut(uint256 amountIn, address tokenIn) OR router.getAmountsOut(uint amountIn, Route[] memory routes)
  },
  {
    id: 'bsc-swapfish',
    name: 'SwapFish',
    type: 'uniswapv2',
    routerAddress: '0x33141e87ad2DFae5FBd12Ed6e61Fa2374aAeD029',
    factoryAddress: '0x71539D09D3890195dDa87A6198B98B75211b72F3',
    pairInitHash: '0xfa92cf9f91596341d1d4b5e0903226886fea1aebab892d11d3c2c1d14ae97534',
    minimumLiquidity: '1000',
    mintFeeNumerator: '2',
    mintFeeDenominator: '3',
    swapFeeNumerator: '3',
    swapFeeDenominator: '1000',
    getAmountOutMode: 'getAmountOut', // router.getAmountOut(uint amountIn, uint reserveIn, uint reserveOut)
  },
  {
    id: 'bsc-thena',
    name: 'thena',
    type: 'solidly',
    routerAddress: '0x20a304a7d126758dfe6B243D0fc515F83bCA8431',
    factoryAddress: '0xAFD89d21BdB66d00817d4153E055830B1c2B3970',
    pairInitHash: '0x8d3d214c094a9889564f695c3e9fa516dd3b50bc3258207acd7f8b8e6b94fb65',
    minimumLiquidity: '1000',
    swapFeeNumerator: '4',
    swapFeeDenominator: '10000', // DYNAMIC pair.swapFee() (default 2000 volatile, 10000 stable)
    getAmountOutMode: 'getAmountOut', // router.getExactAmountOut(uint amountIn, address tokenIn, address tokenOut, bool stable) -> pair.getAmountOut(uint256 amountIn, address tokenIn) OR router.getAmountsOut(uint amountIn, Route[] memory routes)
  },
];
