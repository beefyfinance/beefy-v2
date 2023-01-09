import { isTokenNative, TokenEntity } from '../../../entities/token';
import { AxiosError } from 'axios';

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
