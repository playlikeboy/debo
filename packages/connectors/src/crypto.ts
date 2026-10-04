import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

export interface EncryptedPayload {
  iv: string; // hex
  tag: string; // hex
  ciphertext: string; // hex
}

/**
 * Encrypts arbitrary text using AES-256-GCM.
 * Key must be exactly 32 bytes (256 bits).
 */
export function encryptCredential(plaintext: string, secretKey: string | Buffer): EncryptedPayload {
  const key =
    typeof secretKey === 'string' ? Buffer.from(secretKey.padEnd(32, '0').slice(0, 32)) : secretKey;
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ciphertext,
  };
}

/**
 * Decrypts an AES-256-GCM payload.
 */
export function decryptCredential(payload: EncryptedPayload, secretKey: string | Buffer): string {
  const key =
    typeof secretKey === 'string' ? Buffer.from(secretKey.padEnd(32, '0').slice(0, 32)) : secretKey;
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}
