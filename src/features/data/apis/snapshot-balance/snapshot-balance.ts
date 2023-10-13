import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type { ISnapshotBalanceApi, SnapshotBalanceResponse } from './snapshot-balance-types';

export class SnapshotBalanceApi implements ISnapshotBalanceApi {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://bifi.beefy.finance',
    });
  }

  public async getUserSnapshotBalance(address: string): Promise<SnapshotBalanceResponse> {
    try {
      const res = await this.api.get(`/balance/${address}`);
      return res.data.balance;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response.status === 404) {
          return {};
        }
      }
      throw err;
    }
  }
}
