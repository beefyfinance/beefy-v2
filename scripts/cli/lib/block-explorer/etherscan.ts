import { Address, getAddress, Hash, Hex } from 'viem';
import { BlockExplorerError, IBlockExplorer, Log, Result } from './types';
import {
  EtherscanFailureResponse,
  EtherscanLogsReponse,
  EtherscanLogsRequest,
} from './etherscan-types';
import { FetchJson } from '../../utils/http/types';
import { getEventLogTopics } from '../../utils/event-logs';
import { pConsole } from '../../utils/console';

const MAX_RESULTS = 10_000;
const MAX_RESULTS_PER_PAGE = 1_000;
const MAX_PAGES = Math.trunc(MAX_RESULTS / MAX_RESULTS_PER_PAGE);
const FIRST_PAGE = 1;
const LAST_PAGE = FIRST_PAGE + MAX_PAGES - 1;

export class EtherscanError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message, cause ? { cause } : undefined);
    this.name = 'EtherscanError';
  }
}

function getErrorMessage(response: EtherscanFailureResponse): string {
  return typeof response.result === 'string' && response.result.length
    ? `${response.message}: ${response.result}`
    : response.message;
}

export class EtherscanBlockExplorer implements IBlockExplorer {
  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string,
    protected readonly http: FetchJson
  ) {}

  async getLogs(address: Address, topics: Hash[]): Promise<Result<Log[]>> {
    const requestParams: EtherscanLogsRequest = {
      apikey: this.apiKey,
      module: 'logs',
      action: 'getLogs',
      page: FIRST_PAGE,
      offset: MAX_RESULTS_PER_PAGE,
      address,
    };
    for (let i = 0; i < topics.length; i++) {
      requestParams[`topic${i}`] = topics[i];
      if (i > 0) {
        requestParams[`topic${i - 1}_${i}_opr`] = 'and';
      }
    }

    const fetchFn = async (page: number): Promise<Log[]> => {
      const response = await this.http.get<EtherscanLogsReponse>({
        url: this.baseUrl,
        params: { ...requestParams, page },
      });
      if (response.status !== '1') {
        throw new EtherscanError(getErrorMessage(response));
      }

      return response.result.map(log => ({
        address: getAddress(log.address),
        topics: getEventLogTopics(log.topics),
        data: log.data,
        blockNumber: BigInt(log.blockNumber),
        blockHash: log.blockHash,
        timestamp: Number(log.timeStamp),
        logIndex: Number(log.logIndex),
        transactionHash: log.transactionHash,
        transactionIndex: Number(log.transactionIndex),
      }));
    };

    return this.getLogsPage(fetchFn, FIRST_PAGE);
  }

  protected async getLogsPage(
    fetchFn: (page: number) => Promise<Log[]>,
    page: number = 1
  ): Promise<Result<Log[]>> {
    try {
      const logs = await fetchFn(page);
      const next =
        logs.length === MAX_RESULTS_PER_PAGE && page < LAST_PAGE
          ? () => this.getLogsPage(fetchFn, page + 1)
          : false;
      return { success: true as const, result: logs, next };
    } catch (error: unknown) {
      throw new BlockExplorerError(
        error instanceof Error ? error : new Error('Unknown error', { cause: error }),
        () => this.getLogsPage(fetchFn, page)
      );
    }
  }
}
