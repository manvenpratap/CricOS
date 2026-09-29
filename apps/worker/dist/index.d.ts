import pg from 'pg';
export declare function processOutbox(client: pg.Client): Promise<number>;
export declare function expireHolds(client: pg.Client): Promise<number>;
//# sourceMappingURL=index.d.ts.map