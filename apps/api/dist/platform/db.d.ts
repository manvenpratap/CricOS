import pg from 'pg';
export declare const pool: import("pg").Pool;
export declare function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params?: unknown[]): Promise<pg.QueryResult<T>>;
export declare function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T>;
export declare function isDbConnected(): Promise<boolean>;
export declare function closeDbPool(): Promise<void>;
export declare function getPoolStats(): {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
};
//# sourceMappingURL=db.d.ts.map