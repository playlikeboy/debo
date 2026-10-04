import { describe, expect, it } from 'bun:test';
import { R2StorageService, buildSourceStorageKey, sanitizeFilename } from '../src/index';

describe('@debo/storage', () => {
  it('sanitizes dangerous filenames against path traversal', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('etc_passwd');
    expect(sanitizeFilename('report (Q3) [FINAL]!.pdf')).toBe('report _Q3_ _FINAL__.pdf');
    expect(() => sanitizeFilename('   ')).toThrow('Invalid or empty filename');
  });

  it('builds strictly workspace-scoped storage keys', () => {
    const key = buildSourceStorageKey('wsp_test123', 'src_file999', 'financial-audit.pdf');
    expect(key).toBe('workspaces/wsp_test123/sources/src_file999/financial-audit.pdf');
  });

  it('rejects invalid workspaceId or sourceId format', () => {
    expect(() => {
      buildSourceStorageKey('invalid_wsp', 'src_file', 'doc.txt');
    }).toThrow('Invalid workspaceId prefix');

    expect(() => {
      buildSourceStorageKey('wsp_valid', 'bad_src', 'doc.txt');
    }).toThrow('Invalid sourceId prefix');
  });

  it('instantiates R2StorageService cleanly', () => {
    const service = new R2StorageService({
      accountId: 'test_account',
      accessKeyId: 'test_key',
      secretAccessKey: 'test_secret',
      bucketName: 'debo-test-bucket',
    });
    expect(service).toBeDefined();
    expect(typeof service.getSignedDownloadUrl).toBe('function');
    expect(typeof service.getSignedUploadUrl).toBe('function');
  });
});
