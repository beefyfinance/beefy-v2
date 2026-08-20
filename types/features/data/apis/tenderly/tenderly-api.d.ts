import type { TenderlyCredentials } from '../../actions/tenderly';
import type { TenderlySimulateRequest, TenderlySimulateResponse, TenderlySimulation, TenderlySimulationsRequest } from './types';
import type { FetchParams } from '../../../../helpers/http/types';
export declare class TenderlyApi {
    private config;
    private readonly baseUrl;
    private readonly baseHeaders;
    constructor(config: TenderlyCredentials);
    protected get<T>(path: string, params: FetchParams): Promise<T>;
    protected post<T>(path: string, body: unknown): Promise<T>;
    fetchSimulations(request: TenderlySimulationsRequest): Promise<TenderlySimulation[]>;
    simulate(request: TenderlySimulateRequest): Promise<TenderlySimulateResponse>;
    simulateBundle(request: TenderlySimulateRequest[]): Promise<TenderlySimulateResponse[]>;
}
