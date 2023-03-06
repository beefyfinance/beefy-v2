import { isTokenNative, TokenEntity } from '../../../entities/token';
import { AxiosError } from 'axios';
import { isZapFeeNonZero, ZapFee } from '../transact-types';
import { QuoteRequest, SwapRequest } from '../../one-inch/one-inch-types';

export const ONE_INCH_NATIVE_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export function tokenToOneInchAddress(token: TokenEntity): string {
  if (isTokenNative(token)) {
    return ONE_INCH_NATIVE_ADDRESS;
  }

  return token.address;
}

export function errorToString(error: AxiosError): string {
  try {
    if (error.response.data?.error && error.response.data?.description) {
      const { error: title, description } = error.response.data;
      return `${title}: ${description}`;
    }
  } catch {}

  return error.message;
}

export function swapWithFee(request: SwapRequest, fee: ZapFee): SwapRequest {
  if (isZapFeeNonZero(fee)) {
    if (!fee.recipient) {
      throw new Error('Fee recipient is not set');
    }

    return {
      ...request,
      fee: (fee.value * 100).toString(),
      referrerAddress: fee.recipient,
    };
  }

  return request;
}

export function quoteWithFee(request: QuoteRequest, fee: ZapFee): QuoteRequest {
  if (isZapFeeNonZero(fee)) {
    if (!fee.recipient) {
      throw new Error('Fee recipient is not set');
    }

    return {
      ...request,
      fee: (fee.value * 100).toString(),
    };
  }

  return request;
}
