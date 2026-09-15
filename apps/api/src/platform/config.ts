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

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const rawEnv = (env.NODE_ENV || 'development').toLowerCase();
  const nodeEnv: AppEnvironment = ['production', 'staging', 'test'].includes(rawEnv)
    ? (rawEnv as AppEnvironment)
    : 'development';

  const port = Number(env.PORT || 3000);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`INVALID_CONFIG: PORT must be an integer between 1 and 65535, received: ${env.PORT}`);
  }

  const host = env.HOST || '0.0.0.0';
  const databaseUrl = env.DATABASE_URL || 'postgresql://cricket:cricket@localhost:5432/cricket';
  const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  const jwtSecret = env.JWT_SECRET || 'dev-secret-change-in-production';
  const paymentMode = env.PAYMENT_MODE === 'live' ? 'live' : 'sandbox';
  const appBaseUrl = env.APP_BASE_URL || `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
  const dbPoolSize = Number(env.DB_POOL_SIZE || 10);

  // Production Security & Reliability Invariants
  if (nodeEnv === 'production') {
    if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret-change-in-production' || env.JWT_SECRET.length < 32) {
      throw new Error(
        'INVALID_PRODUCTION_CONFIG: JWT_SECRET must be explicitly provided in production and contain at least 32 characters for HMAC-SHA256 cryptographic security.'
      );
    }

    if (!env.DATABASE_URL) {
      throw new Error('INVALID_PRODUCTION_CONFIG: DATABASE_URL is required in production.');
    }

    if (!appBaseUrl.startsWith('https://')) {
      throw new Error(
        `INVALID_PRODUCTION_CONFIG: APP_BASE_URL must utilize HTTPS protocol in production, received: ${appBaseUrl}`
      );
    }
  }

  // Staging Security Invariants
  if (nodeEnv === 'staging') {
    if (!env.JWT_SECRET || env.JWT_SECRET === 'dev-secret-change-in-production') {
      throw new Error('INVALID_STAGING_CONFIG: JWT_SECRET cannot be the default developer placeholder in staging.');
    }
  }

  return {
    nodeEnv,
    port,
    host,
    databaseUrl,
    redisUrl,
    jwtSecret,
    paymentMode,
    appBaseUrl,
    dbPoolSize
  };
}
