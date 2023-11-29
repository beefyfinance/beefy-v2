declare module 'web3-eth-abi' {
  import { AbiInput, AbiItem } from 'web3-utils';

  export class AbiCoder {
    encodeFunctionSignature(functionName: string | AbiItem): string;

    encodeEventSignature(functionName: string | AbiItem): string;

    encodeParameter(type: any, parameter: any): string;

    encodeParameters(types: any[], paramaters: any[]): string;

    encodeFunctionCall(abiItem: AbiItem, params: any[]): string; // fixed type: params can be any

    decodeParameter(type: any, hex: string): { [key: string]: any };

    decodeParameters(types: any[], hex: string): { [key: string]: any };

    decodeLog(inputs: AbiInput[], hex: string, topics: string[]): { [key: string]: string };
  }

  const coder: AbiCoder;
  export default coder;
}
