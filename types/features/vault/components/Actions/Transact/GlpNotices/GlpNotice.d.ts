import type { UnlockTimeResult } from './types';
export type GlpNoticeProps = {
    noticeKey: string;
    noticeKeyUnlocks: string;
    onChange: (isLocked: boolean) => void;
    fetchUnlockTime: () => Promise<UnlockTimeResult>;
};
export declare const GlpNotice: (({ noticeKey, noticeKeyUnlocks, onChange, fetchUnlockTime, }: GlpNoticeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
