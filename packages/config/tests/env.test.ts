import { describe, expect, it } from 'bun:test';
import { parseEnv } from '../src/index';

describe('@debo/config', () => {
  it('parses default environment correctly', () => {
    const env = parseEnv({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
    });

    expect(env.NODE_ENV).toBe('test');
    expect(env.DATABASE_URL).toBe('postgres://localhost/test');
    expect(env.R2_BUCKET_NAME).toBe('debo-sources');
  });

  it('rejects invalid NODE_ENV', () => {
    expect(() => {
      parseEnv({ NODE_ENV: 'invalid' as any });
    }).toThrow('Invalid NODE_ENV');
  });
});
