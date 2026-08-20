import type { CuratorEntity } from '../../../data/entities/curator';
declare function CuratorCardComponent({ curatorId }: {
    curatorId: CuratorEntity['id'];
}): import("react/jsx-runtime").JSX.Element;
export declare const CuratorCard: typeof CuratorCardComponent & {
    displayName?: string;
};
export {};
