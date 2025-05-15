import { type FetchResponseError, isFetchResponseError } from '../../../../helpers/http/errors.ts';

export class TenderlyError extends Error {
  constructor(message: string, cause?: FetchResponseError) {
    super(message, cause ? { cause } : undefined);
    this.name = 'TenderlyError';
  }
}

export class TenderlyBadRequestError extends TenderlyError {
  constructor(cause: FetchResponseError, message?: string) {
    super(
      message || 'The request was unacceptable, often due to missing a required parameter.',
      cause
    );
    this.name = 'TenderlyBadRequestError';
  }
}

export class TenderlyUnauthorizedError extends TenderlyError {
  constructor(cause: FetchResponseError, message?: string) {
    super(message || 'No valid API key provided.', cause);
    this.name = 'TenderlyUnauthorizedError';
  }
}

export class TenderlyRequestFailedError extends TenderlyError {
  constructor(cause: FetchResponseError, message?: string) {
    super(message || 'The parameters were valid but the request failed.', cause);
    this.name = 'TenderlyRequestFailedError';
  }
}

export class TenderlyForbiddenError extends TenderlyError {
  constructor(cause: FetchResponseError, message?: string) {
    super(message || 'The API key doesn’t have permissions to perform the request.', cause);
    this.name = 'TenderlyForbiddenError';
  }
}

export class TenderlyInvalidResponseFormatError extends TenderlyError {
  constructor(message: string = 'The response format was invalid.') {
    super(message);
    this.name = 'TenderlyInvalidResponseFormatError';
  }
}

async function tryGetErrorMessageFromResponse(response: Response): Promise<string | undefined> {
  try {
    const json: unknown = await response.json();
    return (
        json && typeof json === 'object' && 'message' in json && typeof json.message === 'string'
      ) ?
        json.message
      : undefined;
  } catch {
    return undefined;
  }
}

export async function errorToTenderlyError(cause: unknown): Promise<TenderlyError | undefined> {
  if (isFetchResponseError(cause)) {
    const message = await tryGetErrorMessageFromResponse(cause.response);

    switch (cause.response.status) {
      case 400:
        return new TenderlyBadRequestError(cause, message);
      case 401:
        return new TenderlyUnauthorizedError(cause, message);
      case 402:
        return new TenderlyRequestFailedError(cause, message);
      case 403:
        return new TenderlyForbiddenError(cause, message);
      default:
        return new TenderlyError(
          message || `${cause.response.status} ${cause.response.statusText || 'unknown error'}`,
          cause
        );
    }
  }

  return undefined;
}
