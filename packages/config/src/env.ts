import { ValidationError } from '@debo/types';

export interface DeboEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  DATABASE_URL?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  SUPERMEMORY_API_KEY?: string;
  TRIGGER_SECRET_KEY?: string;
  DEBO_INTERNAL_AUTH_SECRET?: string;
}

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): DeboEnv {
  const nodeEnv = (rawEnv.NODE_ENV as DeboEnv['NODE_ENV']) || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new ValidationError(`Invalid NODE_ENV: '${nodeEnv}'`);
  }

  return {
    NODE_ENV: nodeEnv,
    DATABASE_URL: rawEnv.DATABASE_URL,
    R2_ACCOUNT_ID: rawEnv.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: rawEnv.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: rawEnv.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: rawEnv.R2_BUCKET_NAME || 'debo-sources',
    SUPERMEMORY_API_KEY: rawEnv.SUPERMEMORY_API_KEY,
    TRIGGER_SECRET_KEY: rawEnv.TRIGGER_SECRET_KEY,
    DEBO_INTERNAL_AUTH_SECRET: rawEnv.DEBO_INTERNAL_AUTH_SECRET,
  };
}
