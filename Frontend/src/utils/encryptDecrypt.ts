import CryptoJS from "crypto-js";

/**
 * Encrypts data using AES-256-CBC.
 * @param data - any object or value to encrypt
 * @param key - hex-encoded secret key (same VITE_SECRET_KEY)
 * @returns { iv: string, data: string } — both hex encoded
 */
export function encrypt(data: unknown, key: string): { iv: string; data: string } {
  const iv = CryptoJS.lib.WordArray.random(16); // random 16 bytes, same as backend's crypto.randomBytes(16)

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Hex.parse(key),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return {
    iv: iv.toString(CryptoJS.enc.Hex),       // hex string
    data: encrypted.ciphertext.toString(CryptoJS.enc.Hex), // hex string
  };
}

/**
 * Decrypts AES-256-CBC encrypted data.
 * @param encryptedData - hex-encoded ciphertext
 * @param iv - hex-encoded initialization vector
 * @param key - hex-encoded secret key
 * @returns parsed JSON object or raw string
 */
export function decrypt(encryptedData: string, iv: string, key: string) {
  if (!encryptedData || typeof encryptedData !== "string") {
    throw new Error(`Decryption failed: 'encryptedData' is missing or not a string (received: ${typeof encryptedData})`);
  }
  if (!iv || typeof iv !== "string") {
    throw new Error(`Decryption failed: 'iv' is missing or not a string (received: ${typeof iv})`);
  }

  const ciphertext = CryptoJS.enc.Hex.parse(encryptedData);

  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: ciphertext,
  });

  const decrypted = CryptoJS.AES.decrypt(
    cipherParams,
    CryptoJS.enc.Hex.parse(key),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

  if (!decryptedStr) {
    throw new Error("Decryption failed — check key, iv, or ciphertext");
  }

  return JSON.parse(decryptedStr);
}