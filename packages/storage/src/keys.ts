import { ValidationError } from '@debo/types';

export function sanitizeFilename(filename: string): string {
  // Strip null bytes and path traversal sequences
  const sanitized = filename
    .replace(/\0/g, '')
    .replace(/(\.\.[\/\\])+/g, '')
    .replace(/[^\w\.\-\s]/gi, '_')
    .trim();

  if (!sanitized) {
    throw new ValidationError('Invalid or empty filename');
  }

  return sanitized;
}

export function buildSourceStorageKey(
  workspaceId: string,
  sourceId: string,
  filename: string,
): string {
  if (!workspaceId.startsWith('wsp_')) {
    throw new ValidationError(`Invalid workspaceId prefix: '${workspaceId}'`);
  }
  if (!sourceId.startsWith('src_')) {
    throw new ValidationError(`Invalid sourceId prefix: '${sourceId}'`);
  }

  const cleanFile = sanitizeFilename(filename);
  return `workspaces/${workspaceId}/sources/${sourceId}/${cleanFile}`;
}
