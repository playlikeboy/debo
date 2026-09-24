import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function getKey(): Buffer {
  const value = process.env.ENCRYPTION_KEY?.trim();
  if (!value || !/^[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte key encoded as 64 hexadecimal characters");
  }
  return Buffer.from(value, "hex");
}

export function isEncryptedSecret(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptSecret(value: string): string {
  if (!value) return "";
  if (isEncryptedSecret(value)) return value;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

/**
 * Decrypts current values and temporarily supports legacy plaintext secrets.
 * Callers should re-encrypt legacy values when they write the record back.
 */
export function decryptSecret(value: string | null | undefined): string {
  if (!value) return "";
  if (!isEncryptedSecret(value)) return value;

  const [, encoded] = value.split(PREFIX);
  const [ivPart, tagPart, ciphertextPart] = encoded.split(".");
  if (!ivPart || !tagPart || !ciphertextPart) throw new Error("Invalid encrypted secret");

  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
