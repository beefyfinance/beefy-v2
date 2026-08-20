import type { DataLoaderState, LoaderNotification, LoaderState } from './data-loader-types';
import type { ChainId } from '../entities/chain';
export type LoaderStatuses = {
    [K in LoaderState['status']]: boolean;
};
export declare function getStatus(globalState: DataLoaderState['global'], chainState: DataLoaderState['byChainId'], addressState?: DataLoaderState['byAddress'][string], excludeChainIds?: ChainId[]): LoaderStatuses;
export declare function getNotifications(sliceState: DataLoaderState, walletAddress?: string): {
    common: LoaderNotification[];
    user?: LoaderNotification[];
};
