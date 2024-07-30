import PQueue from 'p-queue';
import { FetchJson } from './types';
import { getJson, postJson } from './index';

type PQueueOptions = ConstructorParameters<typeof PQueue>[0];

export function createRateLimitedFetchJson(options: PQueueOptions): FetchJson {
  const queue = new PQueue(options);
  return {
    get: async request => queue.add(() => getJson(request)),
    post: async request => queue.add(() => postJson(request)),
  };
}
