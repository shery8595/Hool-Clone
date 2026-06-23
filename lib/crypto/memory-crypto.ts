import { requireAuthSecret } from "@/lib/env";

export const ENCRYPTION_VERSION = "v1";

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

async function deriveStorageKey(userId: string): Promise<CryptoKey> {
  const secret = requireAuthSecret();
  const ikm = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(userId),
      info: new TextEncoder().encode("hoolclone-emotional-v1"),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptMemoryForUser(
  userId: string,
  plaintext: string,
): Promise<{
  ciphertextB64: string;
  nonceB64: string;
  version: string;
}> {
  const key = await deriveStorageKey(userId);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    new TextEncoder().encode(plaintext),
  );

  return {
    ciphertextB64: toBase64(new Uint8Array(ciphertext)),
    nonceB64: toBase64(nonce),
    version: ENCRYPTION_VERSION,
  };
}

export async function decryptMemoryForUser(
  userId: string,
  ciphertextB64: string,
  nonceB64: string,
): Promise<string> {
  const key = await deriveStorageKey(userId);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(nonceB64) },
    key,
    fromBase64(ciphertextB64),
  );
  return new TextDecoder().decode(plaintext);
}
