import type { TenderlyCredentials } from '../../actions/tenderly.ts';
import type {
  TenderlySimulateBundleResponse,
  TenderlySimulateRequest,
  TenderlySimulateResponse,
  TenderlySimulation,
  TenderlySimulationsRequest,
  TenderlySimulationsResult,
} from './types.ts';
import { getJson, postJson } from '../../../../helpers/http/http.ts';
import type { FetchParams } from '../../../../helpers/http/types.ts';
import { errorToTenderlyError, TenderlyInvalidResponseFormatError } from './errors.ts';

export class TenderlyApi {
  private readonly baseUrl: string;
  private readonly baseHeaders: Headers;

  constructor(private config: TenderlyCredentials) {
    this.baseUrl = `https://api.tenderly.co/api/v1/account/${this.config.account}/project/${this.config.project}`;
    this.baseHeaders = new Headers({
      'X-Access-Key': this.config.secret,
      Accept: 'application/json',
    });
  }

  protected async get<T>(path: string, params: FetchParams): Promise<T> {
    try {
      return await getJson<T>({
        url: `${this.baseUrl}${path}`,
        headers: this.baseHeaders,
        params,
      });
    } catch (e: unknown) {
      const error = await errorToTenderlyError(e);
      throw error || e;
    }
  }

  protected async post<T>(path: string, body: unknown): Promise<T> {
    try {
      return await postJson<T>({
        url: `${this.baseUrl}${path}`,
        headers: this.baseHeaders,
        body,
      });
    } catch (e: unknown) {
      const error = await errorToTenderlyError(e);
      throw error || e;
    }
  }

  async fetchSimulations(request: TenderlySimulationsRequest): Promise<TenderlySimulation[]> {
    const result = await this.get<TenderlySimulationsResult>('/simulations', request);

    if (!result || !result.simulations || !Array.isArray(result.simulations)) {
      throw new TenderlyInvalidResponseFormatError();
    }

    return result.simulations;
  }

  async simulate(request: TenderlySimulateRequest): Promise<TenderlySimulateResponse> {
    return await this.post<TenderlySimulateResponse>('/simulate', request);
  }

  async simulateBundle(request: TenderlySimulateRequest[]): Promise<TenderlySimulateResponse[]> {
    const result = await this.post<TenderlySimulateBundleResponse>('/simulate-bundle', {
      simulations: request,
    });

    if (!result || !result.simulation_results || !Array.isArray(result.simulation_results)) {
      throw new TenderlyInvalidResponseFormatError();
    }

    return result.simulation_results;
  }
}
