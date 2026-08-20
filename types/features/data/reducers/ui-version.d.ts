import { type PayloadAction } from '@reduxjs/toolkit';
import type { NewVersionAvailable } from './ui-version-types';
export declare const versionSlice: import("@reduxjs/toolkit").Slice<{
    updateAvailable: false;
} | ({
    updateAvailable: true;
} & NewVersionAvailable), {
    setUpdateAvailable(_: import("immer").WritableDraft<{
        updateAvailable: false;
    }> | import("immer").WritableDraft<{
        updateAvailable: true;
    } & NewVersionAvailable>, action: PayloadAction<NewVersionAvailable>): {
        currentVersion: import("./ui-version-types").BuildVersion;
        newVersion: import("./ui-version-types").BuildVersion;
        reloadFailed: boolean;
        updateAvailable: true;
    };
}, "ui-version", "ui-version", import("@reduxjs/toolkit").SliceSelectors<{
    updateAvailable: false;
} | ({
    updateAvailable: true;
} & NewVersionAvailable)>>;
export declare const setUpdateAvailable: import("@reduxjs/toolkit").ActionCreatorWithPayload<NewVersionAvailable, "ui-version/setUpdateAvailable">;
export declare const versionReducer: import("redux").Reducer<{
    updateAvailable: false;
} | ({
    updateAvailable: true;
} & NewVersionAvailable)>;
