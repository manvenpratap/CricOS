export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';
export interface AppConfig {
    nodeEnv: AppEnvironment;
    port: number;
    host: string;
    databaseUrl: string;
    redisUrl: string;
    jwtSecret: string;
    paymentMode: 'sandbox' | 'live';
    appBaseUrl: string;
    dbPoolSize: number;
}
export declare function loadConfig(env?: NodeJS.ProcessEnv): AppConfig;
//# sourceMappingURL=config.d.ts.map