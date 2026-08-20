export type NormalizedEntity<T extends {
    id: string;
}> = {
    byId: {
        -readonly [id in T['id']]?: T;
    };
    allIds: T['id'][];
};
